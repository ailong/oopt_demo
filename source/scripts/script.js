// Generated by CoffeeScript 1.10.0
(function() {
  var add_info_box_data, build_events, build_info_box, circleGeometry, combine_geometry_by_field, ellipsoid, fly_to_home, get_multy_center, handler, hide_info_box, load_borders, load_fz, load_np, load_regions, load_zp, oopt, ooptLabel, pole_primitive, primitives, redCircleInstance, scene, set_poligon_property, settings, show_info_box, to_north, viewer;

  settings = {
    home: [147, 60, 6000000.0],
    baseMap_ru: "kosmo",
    baseMap_en: "kosmo",
    dataPath: "data/",
    layerPath: "ndata/dv/"
  };

  viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,
    baseLayerPicker: false,
    infoBox: false,
    navigationHelpButton: false,
    geocoder: false,
    animation: false,
    scene3DOnly: true,
    fullscreenButton: false,
    imageryProvider: Cesium.createOpenStreetMapImageryProvider({
      url: {
        "en": settings.baseMap_en,
        "ru": settings.baseMap_ru
      }[lang],
      maximumLevel: 10
    })
  });

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

  ooptLabel = {
    fillColor: Cesium.Color.fromCssColorString('rgba(0,0,0,.7)'),
    font: '57px Helvetica',
    outlineColor: Cesium.Color.fromCssColorString('rgba(255,255,255,.5)'),
    outlineWidth: 12.0,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    scale: 0.27,
    translucencyByDistance: new Cesium.NearFarScalar(2.0e6, 1.0, 3.5e6, 0.0)
  };

  $('.fullscreen_btn').click(function() {
    if ($.fullscreen.isFullScreen()) {
      $.fullscreen.exit();
    } else {
      $('body').fullscreen();
    }
    return false;
  });

  viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
    fly_to_home();
    return commandInfo.cancel = true;
  });

  fly_to_home = function() {
    return scene.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(settings.home[0], settings.home[1], settings.home[2]),
      duration: 3
    });
  };

  scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(settings.home[0], settings.home[1], settings.home[2]),
    duration: 0
  });

  to_north = function() {
    return scene.camera.setView({
      orientation: {
        heading: 0.0,
        pitch: -Cesium.Math.PI_OVER_TWO,
        roll: 0.0
      }
    });
  };

  $(".to_north_btn").on("click", function() {
    return to_north();
  });

  set_poligon_property = function(entity, material) {
    var center, positions;
    entity.polygon.material = material;
    entity.polygon.outline = new Cesium.ConstantProperty(false);
    if (!oopt[entity.properties["Name_" + lang]]) {
      oopt[entity.properties["Name_" + lang]] = [];
    }
    oopt[entity.properties["Name_" + lang]].push(entity);
    oopt[entity.properties["Name_" + lang]]._id = entity.properties.ids_ID;
    positions = entity.polygon.hierarchy['_value'].positions;
    center = Cesium.BoundingSphere.fromPoints(positions).center;
    Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
    entity.position = new Cesium.ConstantPositionProperty(center);
    if (oopt[entity.properties["Name_" + lang]].length === 1) {
      entity.label = new Cesium.LabelGraphics(ooptLabel);
      return entity.label.text = entity.properties["Name_" + lang];
    }
  };

  combine_geometry_by_field = function(entities, field) {
    var entity, j, len, multyObjects;
    multyObjects = [];
    for (j = 0, len = entities.length; j < len; j++) {
      entity = entities[j];
      if (!multyObjects[entity.properties[field]]) {
        multyObjects[entity.properties[field]] = [];
      }
      multyObjects[entity.properties[field]].push(entity);
    }
    return multyObjects;
  };

  get_multy_center = function(array) {
    var _points, center, j, len, polygon;
    _points = [];
    for (j = 0, len = array.length; j < len; j++) {
      polygon = array[j];
      _points = _points.concat(polygon.polygon.hierarchy.getValue().positions);
    }
    center = Cesium.BoundingSphere.fromPoints(_points).center;
    Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
    return center;
  };

  load_np = function() {
    var dataSource;
    dataSource = new Cesium.GeoJsonDataSource();
    return dataSource.load(settings.layerPath + "np-dv.topojson", {
      clampToGround: true
    }).then(function() {
      var entities, entity, j, len, mat_property;
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      mat_property = new Cesium.ColorMaterialProperty(new Cesium.Color.fromCssColorString('rgba(185, 132, 121,.87)'));
      for (j = 0, len = entities.length; j < len; j++) {
        entity = entities[j];
        if (entity.polygon) {
          entity.isNP = true;
          set_poligon_property(entity, mat_property);
        }
      }
      return load_fz();
    });
  };

  load_np();

  load_fz = function() {
    var dataSource;
    dataSource = new Cesium.GeoJsonDataSource();
    return dataSource.load(settings.layerPath + "fz-dv.topojson", {
      clampToGround: true
    }).then(function() {
      var entities, entity, j, len, mat_property;
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      mat_property = new Cesium.ColorMaterialProperty(new Cesium.Color.fromCssColorString('rgba(208,177,125, .87)'));
      for (j = 0, len = entities.length; j < len; j++) {
        entity = entities[j];
        if (entity.polygon) {
          entity.isFZ = true;
          set_poligon_property(entity, mat_property);
        }
      }
      return load_zp();
    });
  };

  load_zp = function() {
    var dataSource;
    dataSource = new Cesium.GeoJsonDataSource();
    return dataSource.load(settings.layerPath + "zp-dv.topojson", {
      clampToGround: true
    }).then(function() {
      var entities, entity, j, len, mat_property;
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      mat_property = new Cesium.ColorMaterialProperty(new Cesium.Color.fromCssColorString('rgba(105,131,40, .87)'));
      for (j = 0, len = entities.length; j < len; j++) {
        entity = entities[j];
        if (entity.polygon) {
          entity.isZP = true;
          set_poligon_property(entity, mat_property);
        }
      }
      return build_events();
    });
  };

  build_events = function() {
    var dataSource;
    dataSource = new Cesium.GeoJsonDataSource();
    return dataSource.load(settings.layerPath + "events.geojson").then(function() {
      var entities, entity, j, len, results;
      viewer.dataSources.add(dataSource);
      entities = dataSource.entities.values;
      results = [];
      for (j = 0, len = entities.length; j < len; j++) {
        entity = entities[j];
        entity.billboard = void 0;
        results.push(entity.point = new Cesium.PointGraphics({
          color: Cesium.Color.fromCssColorString('#30b2f1'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(0,0,0,.7)'),
          outlineWidth: 6,
          pixelSize: 11
        }));
      }
      return results;
    }, load_borders());
  };

  load_borders = function() {
    var border_source;
    border_source = new Cesium.GeoJsonDataSource();
    return border_source.load(settings.layerPath + 'federal_dv.topojson', {
      clampToGround: true
    }).then(function() {
      var b_entities, b_entitiy, j, len, positions;
      b_entities = border_source.entities.values;
      for (j = 0, len = b_entities.length; j < len; j++) {
        b_entitiy = b_entities[j];
        positions = b_entitiy.polygon.hierarchy.getValue().positions;
        primitives.add(new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: positions,
              width: 1.0,
              vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color.fromCssColorString('rgba(153,153,153, .67)'))
            }
          }),
          appearance: new Cesium.PolylineColorAppearance()
        }));
      }
      return load_regions();
    });
  };

  load_regions = function() {
    var border_source;
    border_source = new Cesium.GeoJsonDataSource();
    return border_source.load(settings.layerPath + 'regional_dv.topojson', {
      clampToGround: true
    }).then(function() {
      var b_entities, b_entitiy, center, item, j, key, len, multyObjects, positions, results;
      b_entities = border_source.entities.values;
      for (j = 0, len = b_entities.length; j < len; j++) {
        b_entitiy = b_entities[j];
        positions = b_entitiy.polygon.hierarchy.getValue().positions;
        primitives.add(new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: positions,
              width: 1.0,
              vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color.fromCssColorString('rgba(153,153,153, .67)'))
            }
          }),
          appearance: new Cesium.PolylineColorAppearance()
        }));
      }
      multyObjects = combine_geometry_by_field(b_entities, "osm_id");
      results = [];
      for (key in multyObjects) {
        item = multyObjects[key];
        center = get_multy_center(item);
        results.push(viewer.entities.add({
          position: center,
          label: {
            text: item[0].properties.name,
            fillColor: Cesium.Color.fromCssColorString('rgba(60, 83, 48, 0.5)'),
            font: '60px Helvetica',
            style: Cesium.LabelStyle.FILL,
            scale: 0.28,
            translucencyByDistance: new Cesium.NearFarScalar(7.0e6, 1.0, 8e6, 0.0)
          }
        }));
      }
      return results;
    });
  };

  add_info_box_data = function(term, value) {
    return $(".info-box__data").append("<div class='info-box__data__item'><span class='info-box__data__term'> " + term + ": </span><span class='info-box__data__value'>" + value + "</span></div>");
  };

  build_info_box = function(data) {
    var dataImg, fotorama, i, j, ref;
    $(".info-box__title").text(data.descript);
    fotorama = $(".fotorama").data("fotorama");
    if (data.num_images === 1) {
      $(".fotorama").addClass("fotorama--one-image");
    } else {
      $(".fotorama--one-image").removeClass("fotorama--one-image");
    }
    dataImg = [];
    for (i = j = 1, ref = data.num_images; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      dataImg.push({
        img: settings.dataPath + "events/" + data.id + "/" + i + ".jpg"
      });
    }
    if (fotorama) {
      fotorama.show(0);
      fotorama.load(dataImg);
    } else {
      $(".fotorama").fotorama({
        data: dataImg
      });
      fotorama = $(".fotorama").data("fotorama");
    }
    $(".info-box__data").empty();
    if (data.status && (data.status !== "")) {
      add_info_box_data("Статус", data.status);
    }
    if (data.rayon && (data.rayon !== "")) {
      add_info_box_data("Район", data.rayon);
    }
    if (data.lat && data.lon && (data.lat !== "") && (data.lon !== "")) {
      return add_info_box_data("Координаты", data.lat + "°, " + data.lon + "°");
    }
  };

  show_info_box = function() {
    return $("body").addClass("show-info");
  };

  hide_info_box = function() {
    return $("body").removeClass("show-info");
  };

  handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

  ellipsoid = scene.globe.ellipsoid;

  handler.setInputAction((function(movement) {
    var target;
    target = scene.pick(movement.position);
    if (target) {
      if (target.id.point) {
        build_info_box(target.id.properties);
        if (!$("body").hasClass("show-info")) {
          return show_info_box();
        }
      } else {
        return hide_info_box();
      }
    } else {
      return hide_info_box();
    }
  }), Cesium.ScreenSpaceEventType.LEFT_CLICK);

  $(".js-closeInfoBox").on("click", function(e) {
    e.preventDefault();
    return hide_info_box();
  });

  $('.home_btn').on('click', function() {
    return fly_to_home();
  });

}).call(this);

//# sourceMappingURL=script.js.map
