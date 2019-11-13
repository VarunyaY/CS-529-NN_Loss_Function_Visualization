window.addEventListener('DOMContentLoaded', () => {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer();
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update()

    camera.position.set(0, 0, 5);
    renderer.setSize(600, 400);
    document.getElementById('scene').appendChild(renderer.domElement);

    var axesHelper = new THREE.AxesHelper(1000);
    axesHelper.translateY(-2);
    axesHelper.rotation.x = -Math.PI / 2;
    scene.add(axesHelper);

    var loss_mesh = {};
    var acc_mesh = {};

    var loss_flag = {
        'resnet': 0,
        'densenet': 0,
        'vgg': 0,
        'resnet_no_short': 0
    };

    var acc_flag = {
        'resnet': 0,
        'densenet': 0,
        'vgg': 0,
        'resnet_no_short': 0
    };

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

    function addEvent(id, model, type) {
        d3.select(id)
            .on('click', function () {

                if (type === 'loss') {
                    if (loss_flag[model] === 0) {
                        scene.add(loss_mesh[model])

                        loss_flag[model] = 1;

                        d3.select(id)
                            .style('background-color', '#3174c0')
                    } else {
                        scene.remove(loss_mesh[model]);
                        loss_flag[model] = 0;

                        d3.select(id)
                            .style('background-color', '#1b426e')
                    }
                } else {
                    if (acc_flag[model] === 0) {
                        scene.add(acc_mesh[model])

                        acc_flag[model] = 1;

                        d3.select(id)
                            .style('background-color', '#3174c0')
                    } else {
                        scene.remove(acc_mesh[model]);
                        acc_flag[model] = 0;

                        d3.select(id)
                            .style('background-color', '#1b426e')
                    }
                }
            })
    }

    function loadData(filename) {
        d3.json('assets/data/' + filename, function (data) {

            //loss
            if (filename === 'resnet_train_loss.json') {
                loss_mesh['resnet'] = create_mesh(data, 'loss')
                addEvent('#b_resnet_loss', 'resnet', 'loss');
            }

            if (filename === 'densenet_train_loss.json') {
                loss_mesh['densenet'] = create_mesh(data, 'loss')
                addEvent('#b_densenet_loss', 'densenet', 'loss');
            }

            if (filename === 'vgg_train_loss.json') {
                loss_mesh['vgg'] = create_mesh(data, 'loss')
                addEvent('#b_vgg_loss', 'vgg', 'loss');
            }

            if (filename === 'resnet_ns_train_loss.json') {
                loss_mesh['resnet_no_short'] = create_mesh(data, 'loss')
                addEvent('#b_resnet_ns_loss', 'resnet_no_short', 'loss');
            }

            //accuracy
            if (filename === 'resnet_train_accuracy.json') {
                acc_mesh['resnet'] = create_mesh(data, 'accuracy')
                addEvent('#b_resnet_acc', 'resnet', 'accuracy');
            }

            if (filename === 'densenet_train_accuracy.json') {
                acc_mesh['densenet'] = create_mesh(data, 'accuracy')
                addEvent('#b_densenet_acc', 'densenet', 'accuracy');
            }

            if (filename === 'vgg_train_accuracy.json') {
                acc_mesh['vgg'] = create_mesh(data, 'accuracy')
                addEvent('#b_vgg_acc', 'vgg', 'accuracy');
            }

            if (filename === 'resnet_ns_train_accuracy.json') {
                acc_mesh['resnet_no_short'] = create_mesh(data, 'accuracy')
                addEvent('#b_resnet_ns_acc', 'resnet_no_short', 'accuracy');
            }
        })
    }

    for (i = 0; i < file_names.length; i++) {
        loadData(file_names[i]);
    }

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

    var y = x;

    function create_mesh(data, type) {
        var X_keys = Object.keys(data)
        var Y_keys = Object.keys(data)

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
        var scalefacz = 0.05

        if (type === 'loss') {
            var color = d3.scaleLinear()
                .domain([d3.min(values), (d3.min(values) + d3.max(values) / 2), d3.max(values)])
                .range(['blue', 'skyblue', 'red'])
        } else {
            var color = d3.scaleLinear()
                .domain([d3.min(values), (d3.min(values) + d3.max(values) / 2), d3.max(values)])
                .range(['red', 'skyblue', 'blue'])
        }
        for (var k = 0; k < vertices_count; ++k) {
            var newvert = new THREE.Vector3((xgrid[k] - xmid) * scalefac, (ygrid[k] - ymid) * scalefac, (values[k] - zmid) * scalefacz);
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

    //loss legend
    var color_scale_loss = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['blue', 'skyblue', 'red'])

    var defs = d3.select('#lossLegendSVG')
        .append("defs");

    var linearGradient = defs.append("linearGradient")
        .attr('id', 'linear_gradient_L')

    linearGradient
        .attr("x1", "0%")
        .attr("y1", "50%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    linearGradient.selectAll("stop")
        .data(color_scale_loss.range())
        .enter()
        .append("stop")
        .attr("offset", function (d, i) {
            return i / (color_scale_loss.range().length);
        })
        .attr("stop-color", function (d) {
            return d;
        });

    d3.select('#lossLegendSVG')
        .append("rect")
        .attr('id', 'lossLegendBar')


    //accuracy Legend   
    var color_scale_acc = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['red', 'skyblue', 'blue'])

    var defs = d3.select('#accLegendSVG')
        .append("defs");

    linearGradient = defs.append("linearGradient")
        .attr('id', 'linear_gradient_A')

    linearGradient
        .attr("x1", "0%")
        .attr("y1", "50%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    linearGradient.selectAll("stop")
        .data(color_scale_acc.range())
        .enter()
        .append("stop")
        .attr("offset", function (d, i) {
            return i / (color_scale_acc.range().length);
        })
        .attr("stop-color", function (d) {
            return d;
        });

    d3.select('#accLegendSVG')
        .append("rect")
        .attr('id', 'accLegendBar')

    //wireframe
    var wireframe_flag = 0;

    d3.select('#b_wireframe')
        .on('change', function () {
            if (wireframe_flag === 0) {
                for (model in loss_mesh) {
                    if (loss_flag[model] == 1) {
                        scene.remove(loss_mesh[model]);
                        loss_mesh[model].material.wireframe = true;
                        scene.add(loss_mesh[model])
                    }
                    loss_mesh[model].material.wireframe = true;
                }

                for (model in acc_mesh) {
                    if (acc_flag[model] === 1) {
                        scene.remove(acc_mesh[model]);
                        acc_mesh[model].material.wireframe = true;
                        scene.add(acc_mesh[model])
                    }
                    acc_mesh[model].material.wireframe = true;
                }

                wireframe_flag = 1;
            } else {
                for (model in loss_mesh) {
                    if (loss_flag[model] == 1) {
                        scene.remove(loss_mesh[model]);
                        loss_mesh[model].material.wireframe = false;
                        scene.add(loss_mesh[model])
                    }
                    loss_mesh[model].material.wireframe = false;
                }

                for (model in acc_mesh) {
                    if (acc_flag[model] === 1) {
                        scene.remove(acc_mesh[model]);
                        acc_mesh[model].material.wireframe = false;
                        scene.add(acc_mesh[model])
                    }
                    acc_mesh[model].material.wireframe = false;
                }

                wireframe_flag = 0;
            }
        })

    var auto_rotate_flag = 0;
    d3.select('#b_auto_rotate')
        .on('change', function () {
            if (auto_rotate_flag === 0) {
                controls.autoRotate = true;
                auto_rotate_flag = 1;
            } else {
                controls.autoRotate = false;
                auto_rotate_flag = 0;
            }
            controls.update();
        })

    d3.select('#reset')
        .on('click', function () {
            camera.position.set(0, 0, 5);
        })

    function reload() {
        requestAnimationFrame(reload);
        controls.update();
        renderer.render(scene, camera);
    }
    reload();
});