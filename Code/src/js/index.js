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

    var loss_flag = {
        'densenet': 0,
        'resnet_no_short': 0,
        'resnet': 0,
        'vgg': 0,
    };

    var file_names = [
        'densenet_train_loss.json',
        'resnet_ns_train_loss.json',
        'resnet_train_loss.json',
        'vgg_train_loss.json'
    ]

    var xDirection = [];
    var yDirection = [];

    d3.csv('assets/data/xDirection.csv', function (data) {
        for (var k = 0; k < data.length; k++) {
            xDirection.push(parseFloat(data[k]['X']))
        }
    })

    yDirection = xDirection;

    function addEvent(id, model) {
        d3.select(id)
            .on('click', function () {
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
            })
    }

    function loadData(filename) {
        d3.json('assets/data/' + filename, function (data) {

            if (filename === 'resnet_train_loss.json') {
                loss_mesh['resnet'] = create_mesh(data)
                addEvent('#b_resnet_loss', 'resnet');
            }

            if (filename === 'densenet_train_loss.json') {
                loss_mesh['densenet'] = create_mesh(data)
                addEvent('#b_densenet_loss', 'densenet');
            }

            if (filename === 'vgg_train_loss.json') {
                loss_mesh['vgg'] = create_mesh(data)
                addEvent('#b_vgg_loss', 'vgg');
            }

            if (filename === 'resnet_ns_train_loss.json') {
                loss_mesh['resnet_no_short'] = create_mesh(data)
                addEvent('#b_resnet_ns_loss', 'resnet_no_short');
            }
        })
    }

    for (i = 0; i < file_names.length; i++) {
        loadData(file_names[i]);
    }

    function create_mesh(data) {
        var X_keys = Object.keys(data)
        var Y_keys = Object.keys(data)

        var geometry = new THREE.Geometry();

        var xgrid = [];
        var ygrid = [];
        var values = [];

        for (i = 0; i < xDirection.length; i++) {
            for (j = 0; j < yDirection.length; j++) {

                xValue = xDirection[i];
                yValue = yDirection[j];
                zValue = data[xValue][yValue];

                xgrid.push(xValue);
                ygrid.push(yValue)
                values.push(zValue);
            }
        }

        var vertices_count = values.length;

        var zmin = d3.min(values);
        var zmax = d3.max(values);
        zmax = Math.min(zmax, 10 * zmin)

        var scalefacz = 0.05;

        var color = d3.scaleLinear()
            .domain([d3.min(values), (d3.min(values) + d3.max(values) / 2), d3.max(values)])
            .range(['blue', 'skyblue', 'red'])

        for (var k = 0; k < vertices_count; ++k) {
            var newvert = new THREE.Vector3((xgrid[k]), (ygrid[k]), (values[k]) * scalefacz);
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

    
    //cross section-------------------------------------------------------------------------------------------------
    function drawCrossSection(loss) {
        d3.select('#crossSection').select('svg').remove();

        var margin = {
                top: 10,
                right: 30,
                bottom: 30,
                left: 60
            },
            width = 600 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var svg = d3.select("#crossSection")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var filteredData = {};

        for (model in loss_mesh) {
            if (loss_flag[model] === 1) {
                // filteredData[model] = selectedValues(loss)

                var points = [];

                (zvalue - 0.005) && p.Z <= (zvalue + 0.005)

                if ((loss - 0.005) <= loss_mesh[model].geometry.vertices.z && (loss + 0.005) >= loss_mesh[model].geometry.vertices.z) {
                    var filteredX = loss_mesh[model].geometry.vertices.x;
                    var filteredY = loss_mesh[model].geometry.vertices.y;

                    points.push({
                        filteredX,
                        filteredY
                    })
                }
                filteredData[model] = points;
            }
        }

        console.log(filteredData)

        // svg.append('rect')
        //     .attr('x', 0)
        //     .attr('y', 0)
        //     .attr('width', width + 5)
        //     .attr('height', height + 5)
        //     .style('fill', 'white')
        //     .style('stroke', '#000')
        //     .style('stroke-width', 1)

        // var xScale = d3.scaleLinear()
        //     .domain(d3.extent(filteredData.map(p => p.X)))
        //     .range([0, width]);

        // svg.append("g")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(xScale));

        // var yScale = d3.scaleLinear()
        //     .domain(d3.extent(filteredData.map(p => p.Y)))
        //     .range([height, 0]);

        // svg.append("g")
        //     .call(d3.axisLeft(yScale));

        // svg.append('g')
        //     .selectAll("circle")
        //     .data(filteredData)
        //     .enter()
        //     .append("circle")
        //     .attr("cx", function (d) {
        //         return xScale(d.X);
        //     })
        //     .attr("cy", function (d) {
        //         return yScale(d.Y);
        //     })
        //     .attr("r", 3)
        //     .style("fill", function (d) {
        //         return color_scale(d.concentration)
        //     })
    }

    //slider for rectangle
    var slider = document.getElementById("myRange");
    slider.oninput = function () {
        drawCrossSection(0);
    }

    //-------------------------------------------------------------------------------------------------------------


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


    //wireframe
    var wireframe_flag = 0;

    d3.select('#b_wireframe')
        .on('change', function () {
            if (wireframe_flag === 0) {
                for (model in loss_mesh) {
                    if (loss_flag[model] === 1) {
                        scene.remove(loss_mesh[model]);
                        loss_mesh[model].material.wireframe = true;
                        scene.add(loss_mesh[model])
                    }
                    loss_mesh[model].material.wireframe = true;
                }

                wireframe_flag = 1;
            } else {
                for (model in loss_mesh) {
                    if (loss_flag[model] === 1) {
                        scene.remove(loss_mesh[model]);
                        loss_mesh[model].material.wireframe = false;
                        scene.add(loss_mesh[model])
                    }
                    loss_mesh[model].material.wireframe = false;
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