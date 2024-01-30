/** ================================================================================================
 * Three.jsをjsDelivrから読み込む
================================================================================================= */
import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';

/** ================================================================================================
 * テンプレート
================================================================================================= */

/**
 * document.querySelectorのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element}
 */
const $ = selector => document.querySelector(selector);

/**
 * document.querySelectorAllのエイリアス
 * @param {String} selector - CSSセレクタ
 * @returns {Element[]}
 */
const $$ = selector => document.querySelectorAll(selector);

/**
 * ページのロード完了を待つ
 */
await new Promise((resolve) => { window.addEventListener("load", resolve, { once: true }); });


/** ================================================================================================
 * 読み込むモデルのパスなどをまとめたオブジェクトを作成
================================================================================================= */

const modelInfo = {
    "pmx": "/model/TdaMiku.pmx",
    "vmd": [
        "/vmd/motion.vmd"
    ],
}

const offscreenCanvas = new OffscreenCanvas(1920, 1080);

/** ================================================================================================
 * 描画空間の初期化
================================================================================================= */

console.log(THREE);

/**
 * シーン、レンダラー、メッシュ、カメラ、ヘルパーを保管するオブジェクトを作成
 * ついでにシーンとレンダラーを作成
 */
const space = {
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer({ antialias: true, canvas: offscreenCanvas }),
    camera: null,
    mesh: null,
    helper: null
};

/**
 * 環境光源を作成
 */
space.scene.add(new THREE.AmbientLight(0xffffff, 0.67));
space.renderer.setClearColor(0xffffff, 0);

/**
 * カメラを作成
 */
space.camera = new THREE.PerspectiveCamera(45, $("canvas").width / $("canvas").height, 1, 1000);
space.camera.position.set(0, 10, 30);

/**
 * MMDLoaderを作成
 */
const loader = new MMDLoader();

/**
 * PMXモデルを読み込む
 */
await new Promise((resolve) => {
    loader.load(modelInfo.pmx, (mesh) => {
        /**
         * モデルをシーンに追加
         */
        space.scene.add(space.mesh = mesh);
        resolve(true);
    });
})

const render = () => {
    space.renderer.clear();
    space.renderer.render(space.scene, space.camera);
    $("canvas").getContext("2d").drawImage(offscreenCanvas, 0, 0);
};

setInterval(render, 1000 / 30);

