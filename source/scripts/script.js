// Generated by CoffeeScript 1.6.3
(function() {
  var bing, bing_map, build_pups, circleGeometry, cities, close_menu, ellipsoid, fly_to_Russia, get_oopt_rect, handler, load_borders, load_cities, load_np, load_zp, oopt, open_info_popup, open_menu, open_photo_popup, open_video_popup, open_web_popup, osm, osm_map, pole_primitive, primitives, redCircleInstance, resize, scene, selected_polygon_name, showed_image, viewer;

  viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,
    baseLayerPicker: false,
    infoBox: false,
    navigationHelpButton: false,
    geocoder: false,
    animation: false,
    scene3DOnly: true,
    fullscreenButton: false
  });

  osm = new Cesium.OpenStreetMapImageryProvider({
    maximumLevel: 500
  });

  osm_map = viewer.scene.imageryLayers.addImageryProvider(osm);

  bing = new Cesium.BingMapsImageryProvider({
    url: 'http://dev.virtualearth.net',
    mapStyle: Cesium.BingMapsStyle.AERIAL,
    tilingScheme: new Cesium.GeographicTilingScheme()
  });

  bing_map = viewer.scene.imageryLayers.addImageryProvider(bing);

  circleGeometry = new Cesium.CircleGeometry({
    center: Cesium.Cartesian3.fromDegrees(90.0, 90.0),
    radius: 560000.0,
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
  });

  redCircleInstance = new Cesium.GeometryInstance({
    geometry: circleGeometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.71, 0.816, 0.816, 1))
    }
  });

  pole_primitive = new Cesium.Primitive({
    geometryInstances: [redCircleInstance],
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true
    })
  });

  pole_primitive.show = false;

  viewer.scene.primitives.add(pole_primitive);

  scene = viewer.scene;

  primitives = scene.primitives;

  oopt = {};

  selected_polygon_name = '';

  resize = function() {
    return $('#cesiumContainer').css('width', parseInt($(document).width()) - 200 + 'px');
  };

  resize();

  $(window).on('resize', resize);

  viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
    fly_to_Russia();
    return commandInfo.cancel = true;
  });

  fly_to_Russia = function() {
    return scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(85, 60, 10000000.0),
      duration: 3
    });
  };

  scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(85, 60, 10000000.0),
    duration: 0
  });

  load_np = function() {
    var dataSource;
    dataSource = new Cesium.GeoJsonDataSource();
    return dataSource.loadUrl("ndata/np-bcc.topojson").then(function() {
      var entities, entity, mat_property, _i, _len;
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.entities;
      mat_property = Cesium.ColorMaterialProperty.fromColor(new Cesium.Color(0, 0.3, 0.9, 0.6));
      for (_i = 0, _len = entities.length; _i < _len; _i++) {
        entity = entities[_i];
        if (entity.polygon) {
          entity.polygon.material = mat_property;
          entity.polygon.outline = new Cesium.ConstantProperty(false);
          entity.isNP = true;
          if (!oopt[entity.properties.NAME_EN]) {
            oopt[entity.properties.NAME_EN] = [];
          }
          oopt[entity.properties.NAME_EN].push(entity);
        }
      }
      return load_zp();
    });
  };

  load_np();

  load_zp = function() {
    var dataSource;
    dataSource = new Cesium.GeoJsonDataSource();
    return dataSource.loadUrl("ndata/zp-bcc.topojson").then(function() {
      var entities, entity, mat_property, _i, _len;
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.entities;
      mat_property = Cesium.ColorMaterialProperty.fromColor(new Cesium.Color(0, 0.9, 0.3, 0.6));
      for (_i = 0, _len = entities.length; _i < _len; _i++) {
        entity = entities[_i];
        if (entity.polygon) {
          entity.polygon.material = mat_property;
          entity.polygon.outline = new Cesium.ConstantProperty(false);
          entity.isNP = false;
          if (!oopt[entity.properties.NAME_EN]) {
            oopt[entity.properties.NAME_EN] = [];
          }
          oopt[entity.properties.NAME_EN].push(entity);
        }
      }
      return build_pups();
    });
  };

  build_pups = function() {
    var billboards, center, color, entity_key, key, keys, rect, _i, _len;
    billboards = scene.primitives.add(new Cesium.BillboardCollection());
    keys = [];
    for (key in oopt) {
      keys.push(key);
    }
    keys = keys.sort();
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      entity_key = keys[_i];
      $(".left_menu").append('<div>');
      $(".left_menu div:last-child").text(entity_key).on('click', function(e) {
        var rect, text;
        text = $(this).text();
        rect = get_oopt_rect(text);
        scene.camera.flyToRectangle({
          destination: rect
        });
        setTimeout(open_menu, 100);
        return e.stopPropagation();
      });
      if (oopt[entity_key][0].isNP) {
        color = new Cesium.Color(0, 0.3, 0.9, 1);
        $(".left_menu div:last-child").addClass('np');
      } else {
        $(".left_menu div:last-child").addClass('zp');
        color = new Cesium.Color(0, 0.9, 0.3, 1);
      }
      rect = get_oopt_rect(entity_key);
      center = Cesium.Rectangle.center(rect);
      center = [center.latitude, center.longitude];
      if (entity_key === 'Ostrov Vrangelya') {
        center = [rect.north, rect.east];
      }
      oopt[entity_key].center = center;
      billboards.add({
        image: 'images/dot.png',
        position: Cesium.Cartesian3.fromRadians(center[1], center[0], 20000),
        id: entity_key,
        color: color,
        translucencyByDistance: new Cesium.NearFarScalar(1200000, 0, 1300000, 1)
      });
    }
    return load_borders();
  };

  load_borders = function() {
    var border_source;
    border_source = new Cesium.GeoJsonDataSource();
    return border_source.loadUrl('ndata/russia-bnd.topojson').then(function() {
      var b_entities, b_entitiy, positions, _i, _len, _results;
      b_entities = border_source.entities.entities;
      _results = [];
      for (_i = 0, _len = b_entities.length; _i < _len; _i++) {
        b_entitiy = b_entities[_i];
        positions = b_entitiy.polygon.positions.getValue();
        _results.push(primitives.add(new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: positions,
              width: 1.0,
              vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.8, 0.8, 0.8, 1))
            }
          }),
          appearance: new Cesium.PolylineColorAppearance()
        })));
      }
      return _results;
    }, load_cities());
  };

  load_cities = function() {
    var city, coord, labels, name, _i, _len;
    labels = new Cesium.LabelCollection();
    for (_i = 0, _len = cities.length; _i < _len; _i++) {
      city = cities[_i];
      coord = city['coordinates'];
      name = city['name'];
      labels.add({
        position: Cesium.Cartesian3.fromDegrees(coord[0], coord[1]),
        text: "◉ " + name,
        font: '12px Helvetica'
      });
    }
    return scene.primitives.add(labels);
  };

  handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

  ellipsoid = scene.globe.ellipsoid;

  handler.setInputAction((function(movement) {
    var polygon, polygon_name, rect;
    polygon = scene.drillPick(movement.position)[0];
    if ((typeof polygon.id) === "string") {
      polygon_name = polygon.id;
    } else {
      polygon_name = polygon.id.properties.NAME_EN;
    }
    selected_polygon_name = polygon_name;
    rect = get_oopt_rect(polygon_name);
    scene.camera.flyToRectangle({
      destination: rect
    });
    return setTimeout(open_menu, 100);
  }), Cesium.ScreenSpaceEventType.LEFT_CLICK);

  get_oopt_rect = function(name) {
    var cartographics, polygon, rect, _i, _len, _points, _ref;
    _points = [];
    _ref = oopt[name];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      polygon = _ref[_i];
      _points = _points.concat(polygon.polygon.positions.getValue());
    }
    cartographics = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(_points);
    cartographics = cartographics.filter(function(val) {
      return val.height === 0;
    });
    rect = Cesium.Rectangle.fromCartographicArray(cartographics);
    rect.south -= Math.abs(rect.south - rect.north) * 0.6;
    rect.north += Math.abs(rect.south - rect.north) * 0.1;
    return rect;
  };

  cities = [
    {
      "coordinates": [37.61325, 55.748],
      "name": "Moscow"
    }, {
      "coordinates": [73.35733, 54.91536],
      "name": "Omsk"
    }, {
      "coordinates": [104.18426, 52.19257],
      "name": "Irkutsk"
    }, {
      "coordinates": [134.85471, 48.5309],
      "name": "Khabarovsk"
    }
  ];

  $('.home_btn').on('click', function() {
    return scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(85, 60, 10000000.0),
      duration: 3
    });
  });

  $('.map_selector').on('click', function(e) {
    if (e.offsetX > 177 / 2) {
      bing_map.alpha = 1;
      osm_map.alpha = 0;
      pole_primitive.show = false;
      return $('.map_selector_fader').transition({
        x: 0
      }, 100, 'ease');
    } else {
      osm_map.alpha = 1;
      bing_map.alpha = 0;
      pole_primitive.show = true;
      return $('.map_selector_fader').transition({
        x: -93
      }, 100, 'ease');
    }
  });

  $('.popup_menu .info').on('click', function(e) {
    e.stopPropagation();
    return open_info_popup();
  });

  $('.popup_menu .video').on('click', function(e) {
    e.stopPropagation();
    return open_video_popup();
  });

  $('.popup_menu .photo').on('click', function(e) {
    e.stopPropagation();
    return open_photo_popup();
  });

  $('.popup_menu .web').on('click', function(e) {
    e.stopPropagation();
    return open_web_popup();
  });

  open_menu = function() {
    return $('.popup_menu').fadeIn(3000);
  };

  close_menu = function() {
    $('.popup_menu').fadeOut();
    return $('.popup').fadeOut();
  };

  $(document).on('click', close_menu);

  $('.popup_menu').hide();

  $('.popup').hide();

  open_info_popup = function() {
    $('.popup').fadeIn();
    $('.popup>div').hide();
    return $('.popup .info').show();
  };

  open_video_popup = function() {
    $('.popup').fadeIn();
    $('.popup>div').hide();
    return $('.popup .video').show();
  };

  open_photo_popup = function() {
    $('.popup').fadeIn();
    $('.popup>div').hide();
    return $('.popup .photo').show();
  };

  open_web_popup = function() {
    $('.popup').fadeIn();
    $('.popup>div').hide();
    return $('.popup .web').show();
  };

  showed_image = 0;

  $('.photos_left').on('click', function(e) {
    e.stopPropagation();
    if (showed_image !== 0) {
      showed_image--;
      return $('.photo_container').transition({
        x: -500 * showed_image
      }, 300, 'ease');
    }
  });

  $('.photos_right').on('click', function(e) {
    e.stopPropagation();
    if (showed_image !== 4) {
      showed_image++;
      return $('.photo_container').transition({
        x: -500 * showed_image
      }, 300, 'ease');
    }
  });

}).call(this);

/*
//@ sourceMappingURL=script.map
*/
