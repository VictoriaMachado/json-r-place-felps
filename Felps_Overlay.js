// ==UserScript==
// @name         Felps_Overlay
// @namespace    http://tampermonkey.net/
// @version      v2
// @description  '-'
// @author       vic_walker, pedrodbr, R-BR
// @match        https://garlic-bread.reddit.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==

(() => {
    const imagens = [
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/r-brasil.png", // brazil
            "x": 1648,
            "y": 1282,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/EdM-VerissimoNovo2.png", // Enigma do Medo e Espreitador
            "x": 2100,
            "y": 1262,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/edm_symbols.png", // RPG Symbols
            "x": 1264,
            "y": 1764,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/Amigo_Imaginario.png", // Imaginary Friend
            "x": 2324,
            "y": 1127,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/CarenteAntena.png", // Carente
            "x": 1892,
            "y": 1593,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/Anfitriao.png", // Anfitrião
            "x": 1774,
            "y": 1500,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/cellA_talvez_final.png", // cellA
            "x": 2242,
            "y": 1346,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/EstrangeiroContorno.png", // Estrangeiro
            "x": 203,
            "y": 1519,
        },
        {
            url: "https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/felps.png", // Felps
            "x": 1498,
            "y": 1417,
        },
        {
            url:"https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/srSimi.png", // SrSimi (Quackity)
            "x": 0,
            "y": 1797,
        },
        {
            url:"https://raw.githubusercontent.com/VictoriaMachado/json-r-place-felps/main/Imagens/roger_vs_whitebeard_v02.png", // Roger v Whitebeard art (One Piece)
            "x": 0,
            "y": 754,
        }
    ];

    const getData = async (url) => {
        const blob = new Blob([new Uint8Array(await new Promise(resolve =>
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                responseType: "arraybuffer",
                headers: { "Cache-Control": "no-cache" },
                onload: response => resolve(response.response)
            })
        ))], { type: "image/png" });
        const dataURL = await new Promise(resolve => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.readAsDataURL(blob);
        });

        const tempImage = document.createElement("img");
        tempImage.src = dataURL;
        await new Promise(resolve => (tempImage.onload = resolve));

        const cnv = document.createElement("canvas");
        cnv.width = tempImage.width;
        cnv.height = tempImage.height;
        const tmpCtx = cnv.getContext("2d");
        tmpCtx.drawImage(tempImage, 0, 0);
        return tmpCtx.getImageData(0, 0, cnv.width, cnv.height);
    };

    const dither = (src) => {
        const dithered = new ImageData(src.width * 3, src.height * 3);
        for (let y = 0; y < src.height; ++y) {
            for (let x = 0; x < src.width; ++x) {
                const srcPx = (y * src.width + x) * 4;
                const tgtPx = ((y * 3 + 1) * dithered.width + (x * 3 + 1)) * 4;
                dithered.data[tgtPx] = src.data[srcPx];
                dithered.data[tgtPx + 1] = src.data[srcPx + 1];
                dithered.data[tgtPx + 2] = src.data[srcPx + 2];
                dithered.data[tgtPx + 3] = src.data[srcPx + 3];
            }
        }
        return dithered;
    };

    const getImage = async (imagem) => {
        const dithered = dither(await getData(imagem.url));
        const cnv = document.createElement("canvas");
        cnv.width = dithered.width;
        cnv.height = dithered.height;
        cnv.getContext("2d").putImageData(dithered, 0, 0);

        const blob = await new Promise(resolve => cnv.toBlob(resolve, "image/png"));
        const dataURL = await new Promise(resolve => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.readAsDataURL(blob);
        });

        const tempImage = document.createElement("img");
        tempImage.src = dataURL;
        await new Promise(resolve => (tempImage.onload = resolve));

        const left = imagem.x + 1000;
        const top = imagem.y + 500;

        tempImage.style = "position: absolute;"
            + `left: ${left}px;`
            + `top: ${top}px;`
            + "image-rendering: pixelated;"
            + `width: ${tempImage.width / 3}px;`
            + `height: ${tempImage.height / 3}px;`;
        return tempImage;
    };

    let oldImages = {};

    const addImage = async (imagem) => {
        const newImage = await getImage(imagem);
        if (oldImages[imagem.url]) {
            oldImages[imagem.url].remove();
        }

        oldImages[imagem.url] = newImage;
        const canvasContainer = document.getElementsByTagName('garlic-bread-embed')[0]
	        .shadowRoot.children[0]
	        .getElementsByTagName('garlic-bread-share-container')[0]
	        .getElementsByTagName('garlic-bread-camera')[0]
	        .getElementsByTagName('garlic-bread-canvas')[0]
	        .shadowRoot.children[0];

        canvasContainer.insertBefore(newImage, canvasContainer.firstChild);
    };

    if (window.top !== window.self) {
        window.addEventListener("load", () => {
            imagens.forEach(addImage);
            setInterval(() => {
	      imagens.forEach(addImage);
	    }, 60 * 1000);
        }, false);
    }
})();
