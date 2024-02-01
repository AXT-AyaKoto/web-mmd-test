/**
 * ページのロード完了を待つ
 */
await new Promise((resolve) => { window.addEventListener("load", resolve, { once: true }); });

/** ================================================================================================
 * Three.jsをjsDelivrから読み込む
================================================================================================= */
import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import AmmoLib from '/addon/ammo.js';

globalThis.Ammo = await AmmoLib();

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

/** ================================================================================================
 * 読み込むモデルのパスなどをまとめたオブジェクトを作成
================================================================================================= */

const modelInfo = {
    "pmx": "/model/TdaMiku.pmx",
    "vmd": [
        ["motion", "/motion/06A.vmd"],
        ["facial", "/motion/facial.vmd"],
        ["2", "/motion2/sora_greet-smile.vmd"],
    ],
}

const offscreenCanvas = new OffscreenCanvas(1920, 1080);

/** ================================================================================================
 * 描画空間の初期化
================================================================================================= */

console.log(THREE);

let a = performance.now();

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
space.scene.add(new THREE.AmbientLight(0xffffff, 3));
space.renderer.setClearColor(0xffffff, 0);

/**
 * カメラを作成
 */
space.camera = new THREE.PerspectiveCamera(45, $("canvas").width / $("canvas").height, 1, 1000);
space.camera.position.set(0, 16, 16);

/**
 * MMDLoaderを作成
 */
const loader = new MMDLoader();

/**
 * PMXモデルを読み込む
 */
await new Promise((resolve) => {
    loader.load(
        modelInfo.pmx,
        mesh => {
            /**
             * モデルをシーンに追加
             */
            space.scene.add(space.mesh = mesh);
            resolve(true);
        }
    );
});


/**
 * VMDモーションを読み込む
 */
const motions = await Promise.all(modelInfo.vmd.map(([name, path]) => new Promise((resolve) => {
    loader.loadAnimation(path, space.mesh, motion => {
        resolve(motion);
    });
})));


/**
 * モーションを読み込むためのヘルパーを作成
 */
space.helper = new MMDAnimationHelper({ afterglow: 0.0, resetPhysicsOnLoop: true });


space.helper.add(space.mesh, {
    "animation": [motions[0], motions[1]]
});

let b = performance.now();
alert(b - a);

const render = () => {
    space.renderer.clear();
    space.helper.update(1 / 30);
    space.renderer.render(space.scene, space.camera);
    $("canvas").getContext("2d").clearRect(0, 0, $("canvas").width, $("canvas").height);
    $("canvas").getContext("2d").drawImage(offscreenCanvas, 0, 0);
};

let int = setInterval(render, 1000 / 30);

