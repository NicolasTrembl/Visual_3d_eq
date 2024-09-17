import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
import  'katex';

console.log(katex);

const CoordSys = {
    Cartesiennes: 'Cartésiennes',
    Spheriques: 'Sphériques',
    Cylindriques: 'Cylindriques',
};

const Primitives = {
    Cylindre: 'Cylindre',
    Cone: 'Cône',
    Paraboloide: 'Paraboloïde',
    Ellipsoide: 'Ellipsoïde',
    Sphere: 'Sphère',
    Parallelepipede: 'Parallélépipède',
    Cube: 'Cube',
    Inconnu: 'Inconnu',

}


/* Initial Setup */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new ArcballControls( camera, renderer.domElement, scene );


/* Elements */

const cart_before = document.getElementById('before_edit');
const cart_after = document.getElementById('after_edit');
const cart_edit = document.getElementById('cart_edit');

const param_x = document.getElementById('x_param');
const param_y = document.getElementById('y_param');
const param_z = document.getElementById('z_param');
const param_var = document.getElementById('params');

const btn_cube = document.getElementById('btn_cube');

function init() {
    camera.up.set(0,0,1);
    camera.position.set(2,2,2);

    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById('scene').appendChild( renderer.domElement );

}





/* Add Cube */

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );

function drawRepere(coordSys, origin, theta = 0, phi = 0) {
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    const vectorZ = new THREE.Vector3( 0, 0, 1 );
    const arrowHelperZ = new THREE.ArrowHelper( vectorZ, origin, 1, 0x0000ff, 0.3, 0.2 );
    switch (coordSys) {
        case CoordSys.Cartesiennes:
            const vectorX = new THREE.Vector3( 1, 0, 0 );
            const vectorY = new THREE.Vector3( 0, 1, 0 );

            
            const arrowHelperX = new THREE.ArrowHelper( vectorX, origin, 1, 0xff0000, 0.3, 0.2 );
            const arrowHelperY = new THREE.ArrowHelper( vectorY, origin, 1, 0x00ff00, 0.3, 0.2 );
            scene.add( arrowHelperX, arrowHelperY, arrowHelperZ );
        break;
    
        case CoordSys.Cylindriques:
            const vectorR = new THREE.Vector3( Math.cos(theta), Math.sin(theta), 0 );
            const vectorTheta = new THREE.Vector3( -Math.sin(theta), Math.cos(theta), 0 );

            const arrowHelperR = new THREE.ArrowHelper( vectorR, origin, 1, 0xff0000, 0.3, 0.2 );
            const arrowHelperTheta = new THREE.ArrowHelper( vectorTheta, origin, 1, 0x00ff00, 0.3, 0.2 );
            scene.add( arrowHelperR, arrowHelperTheta, arrowHelperZ );

        break;

        case CoordSys.Spheriques:
            const vectorR_ = new THREE.Vector3( Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi) );
            const vectorTheta_ = new THREE.Vector3( Math.cos(phi) * Math.cos(theta), Math.cos(phi) * Math.sin(theta), -Math.sin(phi) );
            const vectorPhi = new THREE.Vector3( -Math.sin(theta), Math.cos(theta), 0 );

            const arrowHelperR_ = new THREE.ArrowHelper( vectorR_, origin, 1, 0x0000ff, 0.3, 0.2 );
            const arrowHelperTheta_ = new THREE.ArrowHelper( vectorTheta_, origin, 1, 0xff0000, 0.3, 0.2 );
            const arrowHelperPhi = new THREE.ArrowHelper( vectorPhi, origin, 1, 0x00ff00, 0.3, 0.2 );
            scene.add( arrowHelperR_, arrowHelperTheta_, arrowHelperPhi );
            
        break;

        default:
            break;
    }
    camera.lookAt( origin );
    controls.target = origin;
    controls.update();
}

function setPrim(result) {
    switch (result.prim) {
        case Primitives.Parallelepipede:
            var geometry = new THREE.BoxGeometry( result.prof, result.larg, result.haut );
            var material = new THREE.MeshBasicMaterial( { color: 0x264653, wireframe: true } );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.set(result.x_offset + result.prof / 2, result.y_offset + result.larg / 2, result.z_offset + result.haut / 2);
            scene.add( cube );
            return cube;
        break;

        default:
            break;
    }
}


function updatefromCart() {
    
    scene.clear();
    drawRepere(CoordSys.Cartesiennes, new THREE.Vector3(0,0,0));

    var result = cartToParam(cart_edit.value);

    var prim = setPrim(result)

    camera.lookAt(prim);
    controls.update();


}

function setCub() {

    katex.render("{\\{(x, y, z) \\in \\rm I\\!R^3;~}", cart_before);
    katex.render("{~\\}}", cart_after);

    cart_edit.value = "-1<=x<=1;-1<=y<=1;-1<=z<=1";


    updatefromCart();

}


function anyMatchContains(matches, str) {
    for (let i = 0; i < matches.length; i++) {
        if (matches[i].includes(str)) {
            return true;
        }
    }
    return false;
}

function getPrim(cart_value) {
    /* check for parallelepiped */

    // const regex = /(\d+)(<=|<)([a-z])((\+|-)(\d))?(<=|<)(\d+)/g;
    const regex = /-?(\d+)(<=)([a-z])((\+|-)(\d))?(<=)-?(\d+)/g;
    const matches = cart_value.match(regex);


    if (matches.length == 3 && anyMatchContains(matches, 'x') && anyMatchContains(matches, 'y') && anyMatchContains(matches, 'z')) {
        return Primitives.Parallelepipede;
    }

    return Primitives.Inconnu;


}

function getParametres(cart_value, prim) {
    switch (prim) {
        case Primitives.Parallelepipede:
            var x_offset = 0;
            var y_offset = 0;
            var z_offset = 0;

            var a = 0;
            var b = 0;

            var c = 0;
            var d = 0;

            var e = 0;
            var f = 0;

            var splited = cart_value.split(';');

            if (splited.length != 3) {
                alert("Erreur de syntaxe, veuillez respecter le format suivant: a<=x+g<=b;c<=y+h<=d;e<=z+i<=f");
                return;
            }
            
            a = parseFloat(splited[0].split('<=')[0]);
            b = parseFloat(splited[0].split('<=')[2]);

            c = parseFloat(splited[1].split('<=')[0]);
            d = parseFloat(splited[1].split('<=')[2]);

            e = parseFloat(splited[2].split('<=')[0]);
            f = parseFloat(splited[2].split('<=')[2]);

            if (splited[0].split('<=')[1].includes('+')) {
                x_offset = parseFloat(splited[0].split('<=')[1].split('+')[1]);
            } else if (splited[0].split('<=')[1].includes('-')) {
                x_offset = -parseFloat(splited[0].split('<=')[1].split('-')[1]);
            }

            if (splited[1].split('<=')[1].includes('+')) {
                y_offset = parseFloat(splited[1].split('<=')[1].split('+')[1]);
            } else if (splited[1].split('<=')[1].includes('-')) {
                y_offset = -parseFloat(splited[1].split('<=')[1].split('-')[1]);
                
            }

            if (splited[2].split('<=')[1].includes('+')) {
                z_offset = parseFloat(splited[2].split('<=')[1].split('+')[1]);
            } else if (splited[2].split('<=')[1].includes('-')) {
                z_offset = -parseFloat(splited[2].split('<=')[1].split('-')[1]);
            }

            return {a, b, c, d, e, f, x_offset, y_offset, z_offset};
    
        default:
            break;
    }
}

function writeParams(x, y, z, param) {
    katex.render(`{x = ${x}}`, param_x);
    katex.render(`{y = ${y}}`, param_y);
    katex.render(`{z = ${z}}`, param_z);

    var text = "{";

    for (const p in param) {
        text += `${p} \\in ${param[p]}\n`
    }

    text += "}";

    katex.render(text, param_var);
}

function cartToParam(cart_value) {
    
    var prim = getPrim(cart_value);

    switch (prim) {
        case Primitives.Parallelepipede:
            var parametres = getParametres(cart_value, prim);

            console.log(parametres);

            if (parametres == undefined) return;
            
            var prof = parametres.b - parametres.a;
            var larg = parametres.d - parametres.c;
            var haut = parametres.f - parametres.e;

            const x_offset = (-parametres.x_offset + parametres.a);
            const y_offset = (-parametres.y_offset + parametres.c);
            const z_offset = (-parametres.z_offset + parametres.e);

            var x_exp = `${prof/haut} \\times h ${(x_offset > 0)? '+' : '' } ${x_offset}`;
            var y_exp = `${larg/haut} \\times h ${(y_offset > 0)? '+' : '' } ${y_offset}`;
            var z_exp = `h ${(z_offset > 0)? '+' : '' } ${z_offset}`;

            var rep_param = {
                h: `[0; ${haut}]`,
            }

            writeParams(x_exp, y_exp, z_exp, rep_param);


            return {prim, prof, larg, haut, x_offset , y_offset, z_offset};
    
        default:
            break;
    }
    


}

init();
setCub();

cart_edit.addEventListener('input', function() {
    updatefromCart();
});

btn_cube.addEventListener('click', function() {
    setCub();
});


function animate() {
    requestAnimationFrame( animate );
	
    controls.update();
    
    renderer.render( scene, camera );

}

renderer.setAnimationLoop( animate );