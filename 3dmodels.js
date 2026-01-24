import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const w = 700;
const h = 700;

// renderer
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); 
renderer.setSize(w,h);
renderer.setClearColor( 0xffffff, 0);



// camera
const fov = 50;
const aspect = 1;
const near = 0.1;
const far = 100;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 5;
camera.position.y = 3;


// scene object
const scene = new THREE.Scene();



// controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.autoRotate =  true;


// load in object
let jax;
const jaxloader = new GLTFLoader();
jaxloader.load( 'assets/3dmodels/Jax.glb', function ( gltf ) {
    jax = gltf.scene;
    jax.scale.set(4,4,4); 
    jax.position.y = -1;
}, undefined, function ( error ) {
    console.error( error );
} ); 

let shark;
const sharkloader = new GLTFLoader();
sharkloader.load( 'assets/3dmodels/Shark.glb', function ( gltf ) {
    shark = gltf.scene;
    shark.rotation.y = Math.PI / 2 *3 -0.7;
    shark.scale.set(1.3,1.3,1.3); 
    scene.add(shark);  // by default shark is rendered in
}, undefined, function ( error ) {
    console.error( error );
} ); 


// environment
const loader = new THREE.TextureLoader();
loader.load('assets/3dmodels/env.jpg', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.environment.intensity = 0.2;
});


// light
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(5, 10, 7);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
fillLight.position.set(-5, 5, -5);
scene.add(fillLight);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.toneMappingExposure = 0.5; 


function animate(t=0) {
    requestAnimationFrame(animate);
    /*if(shark){
        shark.rotation.y = t * 0.001;
    }*/

    // render it!
    renderer.render(scene, camera);
    controls.update();
}
animate();


// buttons integration
const buttons = document.querySelectorAll('.model');
//const canvascontainer = document.querySelector('.canvascontainer');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.id;
            if (name === "jax"){
                
                scene.remove(shark);
                scene.add(jax);
                renderer.toneMappingExposure = 0.3;
            }
            else if (name === "shark"){
                scene.remove(jax);
                scene.add(shark);
                renderer.toneMappingExposure = 0.5;
            }
            // do stuff here
        });
    });
