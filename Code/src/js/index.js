window.addEventListener('DOMContentLoaded', () => {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer();
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 5);
    controls.update()

    var resnet_data;
    var densenet_data;
    var vgg_data;
    var resnet_ns_data;


    renderer.setSize(600, 400);
    document.body.appendChild(renderer.domElement);

    function loadData(filename, loss_color) {
        d3.json('assets/data/' + filename, function (data) {

            var Geometry = new THREE.Geometry();
            var Material = new THREE.PointsMaterial({
                color: loss_color,
                size: 2,
                sizeAttenuation: false,
            });

            X_keys = Object.keys(data)
            Y_keys = Object.keys(data)

            for (i = 0; i < X_keys.length; i++) {
                for (j = 0; j < Y_keys.length; j++) {

                    x = X_keys[i];
                    y = Y_keys[j];
                    z = data[x][y];

                    point = new THREE.Vector3(x, y, z);

                    Geometry.vertices.push(point);
                }
            }

            if (filename === 'resnet_train_loss.json') {
                resnet_data = new THREE.Points(Geometry, Material);
            }

            if (filename === 'densenet_train_loss.json') {
                densenet_data = new THREE.Points(Geometry, Material);
            }

            if (filename === 'vgg_train_loss.json') {
                vgg_data = new THREE.Points(Geometry, Material);
            }
            if (filename === 'resnet_ns_train_loss.json') {
                resnet_ns_data = new THREE.Points(Geometry, Material);
            }
        })
    }

    var model_count = 4;

    file_names = [
        'densenet_train_loss.json',
        'resnet_ns_train_loss.json',
        'resnet_train_loss.json',
        'vgg_train_loss.json'
    ]

    colors = ['red', 'blue', 'yellow', 'white']

    var resnet_flag = 0;
    var densenet_flag = 0;
    var resnet_ns_flag = 0;
    var vgg_flag = 0;

    d3.select('#b_resnet')
        .on('click', function () {
            if (resnet_flag === 0) {
                scene.add(resnet_data)
                resnet_flag = 1;
            } else {
                scene.remove(resnet_data);
                resnet_flag = 0;
            }
        })

    d3.select('#b_densenet')
        .on('click', function () {
            if (densenet_flag === 0) {
                scene.add(densenet_data)
                densenet_flag = 1;
            } else {
                scene.remove(densenet_data);
                densenet_flag = 0;
            }
        })

    d3.select('#b_vgg')
        .on('click', function () {
            if (vgg_flag === 0) {
                scene.add(vgg_data)
                vgg_flag = 1;
            } else {
                scene.remove(vgg_data);
                vgg_flag = 0;
            }
        })

    d3.select('#b_resnet_ns')
        .on('click', function () {
            if (resnet_ns_flag === 0) {
                scene.add(resnet_ns_data)
                resnet_ns_flag = 1;
            } else {
                scene.remove(resnet_ns_data);
                resnet_ns_flag = 0;
            }
        })

    for (i = 0; i < model_count; i++) {
        loadData(file_names[i], colors[i]);
    }

    function reload() {
        requestAnimationFrame(reload);
        controls.update();
        renderer.render(scene, camera);
    }
    reload();
}); //DOM Loaded