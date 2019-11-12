window.addEventListener('DOMContentLoaded', () => {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer();
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 3);
    controls.update()

    renderer.setSize(600, 400);
    document.body.appendChild(renderer.domElement);

    var resnet_loss_data;
    var densenet_loss_data;
    var vgg_loss_data;
    var resnet_ns_loss_data;

    var resnet_acc_data;
    var densenet_acc_data;
    var vgg_acc_data;
    var resnet_ns_acc_data;

    var X_keys;
    var Y_keys;

    var model_count = 4;

    var file_names = [
        'densenet_train_loss.json',
        'resnet_ns_train_loss.json',
        'resnet_train_loss.json',
        'vgg_train_loss.json',

        'densenet_train_accuracy.json',
        'resnet_ns_train_accuracy.json',
        'resnet_train_accuracy.json',
        'vgg_train_accuracy.json'
    ]

    var resnet_loss_flag = 0;
    var densenet_loss_flag = 0;
    var resnet_ns_loss_flag = 0;
    var vgg_loss_flag = 0;

    var resnet_acc_flag = 0;
    var densenet_acc_flag = 0;
    var resnet_ns_acc_flag = 0;
    var vgg_acc_flag = 0;

    var x = [-1, -0.96, -0.92, -0.88, -0.84,
        -0.8, -0.76, -0.72, -0.68, -0.64,
        -0.6, -0.56, -0.52, -0.48, -0.44,
        -0.4, -0.36, -0.32, -0.28, -0.24, -0.2,
        -0.16, -0.12, -0.08, -0.04, 0, 0.04,
        0.08, 0.12, 0.16, 0.2, 0.24,
        0.28, 0.32, 0.36, 0.4, 0.44,
        0.48, 0.52, 0.56, 0.6, 0.64,
        0.68, 0.72, 0.76, 0.8, 0.84, 0.88, 0.92, 0.96, 1
    ]

    var y = [-1, -0.96, -0.92, -0.88, -0.84,
        -0.8, -0.76, -0.72, -0.68, -0.64,
        -0.6, -0.56, -0.52, -0.48, -0.44,
        -0.4, -0.36, -0.32, -0.28, -0.24, -0.2,
        -0.16, -0.12, -0.08, -0.04, 0, 0.04,
        0.08, 0.12, 0.16, 0.2, 0.24,
        0.28, 0.32, 0.36, 0.4, 0.44,
        0.48, 0.52, 0.56, 0.6, 0.64,
        0.68, 0.72, 0.76, 0.8, 0.84, 0.88, 0.92, 0.96, 1
    ]

    function loadData(filename) {
        d3.json('assets/data/' + filename, function (data) {

            //loss
            if (filename === 'resnet_train_loss.json') {
                resnet_loss_data = create_mesh(data)
            }

            if (filename === 'densenet_train_loss.json') {
                densenet_loss_data = create_mesh(data)
            }

            if (filename === 'vgg_train_loss.json') {
                vgg_loss_data = create_mesh(data)
            }

            if (filename === 'resnet_ns_train_loss.json') {
                resnet_ns_loss_data = create_mesh(data)
            }

            //accuracy
            if (filename === 'resnet_train_accuracy.json') {
                resnet_acc_data = create_mesh(data)
            }

            if (filename === 'densenet_train_accuracy.json') {
                densenet_acc_data = create_mesh(data)
            }

            if (filename === 'vgg_train_accuracy.json') {
                vgg_acc_data = create_mesh(data)
            }

            if (filename === 'resnet_ns_train_accuracy.json') {
                resnet_ns_acc_data = create_mesh(data)
            }
        })
    }

    for (i = 0; i < file_names.length; i++) {
        loadData(file_names[i]);
    }

    function create_mesh(data) {
        console.log(data)
        X_keys = Object.keys(data)
        Y_keys = Object.keys(data)

        var geometry = new THREE.Geometry();

        var xgrid = [];
        var ygrid = [];
        var values = [];

        for (i = 0; i < x.length; i++) {
            for (j = 0; j < y.length; j++) {

                a = x[i];
                b = y[j];
                c = data[a][b];

                xgrid.push(a);
                ygrid.push(b)
                values.push(c);
            }
        }

        var vertices_count = values.length;

        var xmin = d3.min(X_keys);
        var xmax = d3.max(X_keys);
        var xmid = 0.5 * (xmin + xmax);
        var xrange = xmax - xmin;

        var ymin = d3.min(Y_keys);
        var ymax = d3.max(Y_keys);
        var ymid = 0.5 * (ymin + ymax);
        var yrange = ymax - ymin;

        var zmin = d3.min(values);
        var zmax = d3.max(values);

        zmax = Math.min(zmax, 10 * zmin)
        var zmid = 0.5 * (zmin + zmax);
        var zrange = zmax - zmin;

        var scalefac = 1
        var scalefacz = 0.1

        var color = d3.scaleLinear()
            .domain([d3.min(values), (d3.min(values) + d3.max(values) / 2), d3.max(values)])
            .range(['blue', 'skyblue', 'red'])

        for (var k = 0; k < vertices_count; ++k) {
            var newvert = new THREE.Vector3((xgrid[k] - xmid) * scalefac, (ygrid[k] - ymid) * scalefac, (values[k]) * scalefacz);
            geometry.vertices.push(newvert);
        }

        for (var j = 0; j < X_keys.length - 1; j++) {
            for (var i = 0; i < Y_keys.length - 1; i++) {

                var n0 = j * X_keys.length + i;
                var n1 = n0 + 1;

                var n2 = (j + 1) * X_keys.length + i + 1;
                var n3 = n2 - 1;

                face1 = new THREE.Face3(n0, n1, n2);
                face2 = new THREE.Face3(n2, n3, n0);

                face1.vertexColors[0] = new THREE.Color(color(values[n0]));
                face1.vertexColors[1] = new THREE.Color(color(values[n1]));
                face1.vertexColors[2] = new THREE.Color(color(values[n2]));

                face2.vertexColors[0] = new THREE.Color(color(values[n2]));
                face2.vertexColors[1] = new THREE.Color(color(values[n3]));
                face2.vertexColors[2] = new THREE.Color(color(values[n0]));

                geometry.faces.push(face1);
                geometry.faces.push(face2);
            }
        }

        var material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
            opacity: 1,
            wireframe: false
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -2;

        return mesh;
    }

    //loss
    d3.select('#b_resnet_loss')
        .on('click', function () {
            if (resnet_loss_flag === 0) {
                scene.add(resnet_loss_data)
                resnet_loss_flag = 1;
                d3.select('#b_resnet_loss')
                    .style('background-color', '#0c610f')
            } else {
                scene.remove(resnet_loss_data);
                resnet_loss_flag = 0;

                d3.select('#b_resnet_loss')
                    .style('background-color', '#4CAF50')
            }
        })

    d3.select('#b_densenet_loss')
        .on('click', function () {
            if (densenet_loss_flag === 0) {
                scene.add(densenet_loss_data)
                densenet_loss_flag = 1;
                d3.select('#b_densenet_loss')
                    .style('background-color', '#0c610f')

            } else {
                scene.remove(densenet_loss_data);
                densenet_loss_flag = 0;
                d3.select('#b_densenet_loss')
                    .style('background-color', '#4CAF50')
            }
        })

    d3.select('#b_vgg_loss')
        .on('click', function () {
            if (vgg_loss_flag === 0) {
                scene.add(vgg_loss_data)
                vgg_loss_flag = 1;
                d3.select('#b_vgg_loss')
                    .style('background-color', '#0c610f')
            } else {
                scene.remove(vgg_loss_data);
                vgg_loss_flag = 0;
                d3.select('#b_vgg_loss')
                    .style('background-color', '#4CAF50')

            }
        })

    d3.select('#b_resnet_ns_loss')
        .on('click', function () {
            if (resnet_ns_loss_flag === 0) {
                scene.add(resnet_ns_loss_data)
                resnet_ns_loss_flag = 1;
                d3.select('#b_resnet_ns_loss')
                    .style('background-color', '#0c610f')
            } else {
                scene.remove(resnet_ns_loss_data);
                resnet_ns_loss_flag = 0;
                d3.select('#b_resnet_ns_loss')
                    .style('background-color', '#4CAF50')
            }
        })

    //accuracy
    d3.select('#b_resnet_acc')
        .on('click', function () {
            if (resnet_acc_flag === 0) {
                scene.add(resnet_acc_data)
                resnet_acc_flag = 1;
                d3.select('#b_resnet_acc')
                    .style('background-color', '#0c610f')
            } else {
                scene.remove(resnet_acc_data);
                resnet_acc_flag = 0;
                d3.select('#b_resnet_acc')
                    .style('background-color', '#4CAF50')
            }
        })

    d3.select('#b_densenet_acc')
        .on('click', function () {
            if (densenet_acc_flag === 0) {
                scene.add(densenet_acc_data)
                densenet_acc_flag = 1;
                d3.select('#b_densenet_acc')
                    .style('background-color', '#0c610f')
            } else {
                scene.remove(densenet_acc_data);
                densenet_acc_flag = 0;
                d3.select('#b_densenet_acc')
                    .style('background-color', '#4CAF50')
            }
        })

    d3.select('#b_vgg_acc')
        .on('click', function () {
            if (vgg_acc_flag === 0) {
                scene.add(vgg_acc_data)
                vgg_acc_flag = 1;
                d3.select('#b_vgg_acc')
                    .style('background-color', '#0c610f')
            } else {
                scene.remove(vgg_acc_data);
                vgg_acc_flag = 0;
                d3.select('#b_vgg_acc')
                    .style('background-color', '#4CAF50')
            }
        })

    d3.select('#b_resnet_ns_acc')
        .on('click', function () {
            if (resnet_ns_acc_flag === 0) {
                scene.add(resnet_ns_acc_data)
                resnet_ns_acc_flag = 1;
                d3.select('#b_resnet_ns_acc')
                    .style('background-color', '#0c610f')
            } else {
                scene.remove(resnet_ns_acc_data);
                resnet_ns_acc_flag = 0;
                d3.select('#b_resnet_ns_acc')
                    .style('background-color', '#4CAF50')
            }
        })

    function reload() {
        requestAnimationFrame(reload);
        controls.update();
        renderer.render(scene, camera);
    }
    reload();
});