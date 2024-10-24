import "./style.css";
import * as THREE from 'three';
import GUI from 'lil-gui';
import {OBJLoader, OrbitControls, PLYLoader} from "three/addons";

let renderer, scene, camera, controls;
var dataset_object, dataset_object_name, dataset_distance;

init();
animate();

function init() {
    const canvas = document.querySelector('canvas');
    renderer = new THREE.WebGLRenderer({canvas});

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.001, 1000);
    controls = new OrbitControls(camera, canvas);

    camera.position.z = -0.0;
    let camera_default_position = camera.position.clone();
    scene.background = new THREE.Color('black');
    {
        scene.add(new THREE.AmbientLight(0x404040));
        const dir_light = new THREE.DirectionalLight();
        dir_light.position.set(0, 0, 100);
        dir_light.intensity = 0.5;
        scene.add(dir_light);
        const skyColor = 0xB1E1FF;  // light blue
        const groundColor = 0xB97A20;  // brownish orange
        const intensity = 0.5;
        const hem_light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(hem_light);
    }

    // obj and ply loader
    const objLoader = new OBJLoader();
    const plyLoader = new PLYLoader();

    function loadObj(obj) {
        objLoader.load('./viewer/models/' + obj.name,
            function (object) {
                let mesh = object.children[0];
                mesh.name = obj.name;
                loadMesh(mesh);
            },
            onLoadProgress, onError
        );
    }

    function loadPly(base_path, ply, object, recenter) {
        plyLoader.load('./viewer/models/' + base_path + "/" + ply,
            function (geometry) {
                let mesh;
                if (geometry.attributes.normal == undefined) {
                    mesh = new THREE.Points(geometry, new THREE.PointsMaterial( { size: 0.005, vertexColors: true } ));
                } else {
                    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
                }
                let transform_matrix = new THREE.Matrix4().fromArray([-1,0,0,0,0,1,0,0,0,0,-1,0,0,0,0,1]);
                let points = mesh.geometry.getAttribute("position");
                points.applyMatrix4(transform_matrix.transpose());
                mesh.geometry.setAttribute("position", points);

                mesh.name = ply;
                loadMesh(mesh, base_path, object, recenter);
            },
            onLoadProgress, onError
        );
    }

    function loadMesh(mesh, base_path, object, recenter) {
        mesh.frustumCulled = false;
        mesh.name = base_path + "/" + mesh.name
        // mesh.src_sensor_space = "";
        // sensor_spaces.forEach(sensor_space => {
        //     if (mesh.name.includes(sensor_space))
        //         mesh.src_sensor_space = sensor_space;
        // });
        // mesh.current_sensor_space = mesh.src_sensor_space;
        // console.log(mesh);
        scene.add(mesh);
        addObjectToGui(mesh, base_path, object);

        if(recenter){
            recenterCamera(mesh);
        }

    }

    function onLoadProgress(xhr) {
        const percentage = xhr.loaded / xhr.total;
        document.getElementById("percentage").innerText = (percentage * 100).toFixed(2).toString() + '%';
        let progressbar = document.getElementById("progressbar");
        progressbar.style.display = 'block';
        progressbar.style.width = (percentage * 100).toString() + '%';
        progressbar.style.backgroundColor = 'rgb(' + Math.round(255 - percentage * 255).toString() + ',' + Math.round(percentage * 255).toString() + ',0)';
        if (percentage === 1)
            progressbar.style.display = 'none';
    }

    function onError(error) {
        console.log('An error happened: ', error);
    }


    // document.getElementById("input").addEventListener("change", handleFiles);
    function handleFiles() {
        const files = this.files;
        if (files === undefined) {
            console.log("no file input");
            return;
        }
        let obj_files = [];
        let ply_files = [];
        let images = [];
        for (let i = 0; i < files.length; i++) {
            if (files[i].name.endsWith(".obj"))
                obj_files.push(files[i]);
            if (files[i].name.endsWith(".ply"))
                ply_files.push(files[i]);
            if (files[i].name.endsWith(".jpg") || files[i].name.endsWith(".png"))
                images.push(files[i]);
        }
        obj_files.forEach(obj_file => {
            loadObj(obj_file);
        });
        ply_files.forEach(ply_file => {
            loadPly(ply_file);
        });
        images.forEach(image => {
            let img = document.getElementById("mesh_image");
            if (img === null) {
                img = document.createElement('img');
                img.id = "mesh_image";
                img.style.zIndex = '100';
                img.style.position = 'absolute';
                img.style.bottom = '0';
                img.style.left = '0';
                img.style.width = '20%';
                document.body.appendChild(img);
            }
            img.src = '../models/' + image.name;
        })
    }

    const gui = new GUI({title: "Viewer Options"});
    // const gui_description = new GUI({title: "Description", container: document.getElementById( 'description' )});
    // description={
    //     descr:"dsdfgdjsgsdjhsjsdf",
    // }
    // gui_description.add(description, "descr")
    const dataset_folder = gui.addFolder("Dataset");
    let options = {
        object: "Cardboard",
        distance: "30 cm",
        reset: function() {
            controls.reset()
        }
    };
    let obj_list = ["Book", "Bottle", "Brazen Rosette", "Bunny",
                "Bunny Box", "Candle", "Cardboard", "Cardboard Box",
                "Concrete Stone", "Corner Reflector", "Flowerpot Brown",
                "Flowerpot Transparent", "Foam Plane", "Hand Printed B",
                "Hand Printed F", "Hand Printed Flat", "Hand Printed U",
                "Metal Angle", "Metal Disk Thick", "Metal Disk Thin",
                "Mirror", "Plunger", "Plushie", "Polystyrene Plate",
                "Pool Ball", "Rubber Foam Plane", "S1 Hand Open", "S1 Hand Open Reverse",
                "S2 Hand Open", "S2 Hand Open Reverse", "Sandpaper k80", "Sandpaper k120",
                "Scrubber", "Silicone Cup", "Sponge", "Statue", "Tape Dispenser",
                "V1 Christmas Ball", "V1 Christmas Ball", "V3 Christmas Ball", "V1 Metal Plate",
                "V2 Metal Plate", "Water Cube", "Wood Ball", "Wood Plane"];

    dataset_object = "cardboard";
    dataset_object_name = "Cardboard"
    dataset_distance = "30";
    loadPly(dataset_object + "/" + dataset_distance, "radar.ply", "Cardboard (30 cm)", true)

    dataset_folder.add(options, "object", obj_list).name("Object").onChange( value => {
        let obj_name = value.toLowerCase().replaceAll(" ", "_");
        dataset_object = obj_name
        dataset_object_name = value;
        loadPly(dataset_object + "/" + dataset_distance, "radar.ply", dataset_object_name + " (" + dataset_distance + "cm)", false)
    });
    dataset_folder.add(options, "distance", ["30 cm", "40 cm", "50 cm"]).name("Object to Sensor Distance").onChange( value  => {
        let distance = value.replaceAll(" cm", "");
        dataset_distance = distance
        loadPly(dataset_object + "/" + dataset_distance, "radar.ply", dataset_object_name + " (" + dataset_distance + "cm)", false)
    });
    dataset_folder.add(options, "reset").name("Reset Camera");
    


    function addObjectToGui(object, base_path, object_name) {
        let default_pointsize = 0.001 * 1.5;


        for(let i = 0; i<scene.children.length; i++) {
            if(scene.children[i].name === object.name) {
                scene.children[i].material.size = default_pointsize;
            }
        }

        for(let i = 0; i < gui.folders.length; i++) {
            if(gui.folders[i]._title === "Dataset") {
                for(let j = 0; j < gui.folders[i].folders.length; j++) {
                    if (gui.folders[i].folders[j]._title === object_name) {
                        return;
                    }
                }
            }

        }

        let object_options = {
            radar : true,
            kinect : false,
            realsense : false,
            gt : false,
            zed : false,
            remove: function() {
                for(let i = 0; i<scene.children.length;) {
                    if(scene.children[i].name.includes(base_path)) {
                        scene.remove(scene.children[i]);
                    } else {
                        i = i + 1;
                    }
                }
                folder.destroy();
            }
        }


        const folder = dataset_folder.addFolder(object_name);
        const sensor_folder = folder.addFolder("Sensors");
        sensor_folder.add(object_options, "radar").name("Enable RF ToF (Radar)").onChange(value => {
            let obj_found = false;
            for(let i = 0; i<scene.children.length; i++) {
                if(scene.children[i].name === base_path + "/radar.ply") {
                    scene.children[i].visible = value;
                    obj_found = true;
                    break;
                }
            }

            if(obj_found == false) {
                loadPly(base_path, "radar.ply", object_name, false);
            }
        });
        sensor_folder.add(object_options, "kinect").name("Enable NIR ToF").onChange(value => {
            let obj_found = false;
            for(let i = 0; i<scene.children.length; i++) {
                if(scene.children[i].name === base_path + "/kinect.ply") {
                    scene.children[i].visible = value;
                    obj_found = true;
                    break;
                }
            }

            if(obj_found == false) {
                loadPly(base_path, "kinect.ply", object_name, false);
            }
        });
        sensor_folder.add(object_options, "realsense").name("Enable Active Stereo").onChange(value => {
            let obj_found = false;
            for(let i = 0; i<scene.children.length; i++) {
                if(scene.children[i].name === base_path + "/realsense.ply") {
                    scene.children[i].visible = value;
                    obj_found = true;
                    break;
                }
            }

            if(obj_found == false) {
                loadPly(base_path, "realsense.ply", object_name, false);
            }
        });
        sensor_folder.add(object_options, "zed").name("Enable Passive Stereo").onChange(value => {
            let obj_found = false;
            for(let i = 0; i<scene.children.length; i++) {
                if(scene.children[i].name === base_path + "/zed.ply") {
                    scene.children[i].visible = value;
                    obj_found = true;
                    break;
                }
            }

            if(obj_found == false) {
                loadPly(base_path, "zed.ply", object_name, false);
            }         });
        sensor_folder.add(object_options, "gt").name("Enable Ground Truth").onChange(value => {
            let obj_found = false;
            for(let i = 0; i<scene.children.length; i++) {
                if(scene.children[i].name === base_path + "/photogrammetry.ply") {
                    scene.children[i].visible = value;
                    obj_found = true;
                    break;
                }
            }

            if(obj_found == false) {
                loadPly(base_path, "photogrammetry.ply", object_name, false);
            }
        });


        folder.add({scale: 1.5}, "scale", 0, 10).name("Pointsize")
            .onChange(value => {
                for(let i = 0; i<scene.children.length; i++) {
                    if(scene.children[i].name.includes(base_path)) {
                        scene.children[i].material.size = value * default_pointsize;
                    }
                }
            });
        folder.add(object_options, "remove").name("Remove Object");
    }

    function applyTransformation(object, src, dest) {
        if (src === dest) {
            console.log("mesh already in " + dest + " space");
            return;
        }
        let transform_matrix = alignment[src + "2" + dest];
        if (transform_matrix == undefined) {
            console.log("src or dest wrong/doesn't exist");
            return;
        }
        transform_matrix = new THREE.Matrix4().fromArray(transform_matrix.flat());
        let points = object.geometry.getAttribute("position");
        points.applyMatrix4(transform_matrix.transpose());
        points.needsUpdate = true;
        recenterCamera(object);

        object.current_sensor_space = dest;
    }
}
function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

function render() {
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) renderer.setSize(width, height, false);
        return needResize;
    }
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
}

function update() {
    controls.update();
}

function recenterCamera(mesh) {
    // set the orbit controls target to the center of the mesh
    // src: https://stackoverflow.com/questions/38305408/threejs-get-center-of-object
    mesh.geometry.computeBoundingBox();
    let center = new THREE.Vector3();
    mesh.geometry.boundingBox.getCenter(center);
    // console.log("center: ", center)
    // mesh.localToWorld(center);
    // controls.target.set(...center);
    controls.target.copy( center );
    controls.saveState();

    // var bb = new THREE.Box3()
    // bb.setFromObject(mesh);
    // bb.center(controls.target);

}
