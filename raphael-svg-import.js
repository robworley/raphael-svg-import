/*
 * Raphael SVG Import 0.0.1 - Extension to Raphael JS
 *
 * Copyright (c) 2009 Wout Fierens
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.importSVG = function (svg) {
  var svgTags = ['rect', 'polyline', 'circle', 'ellipse', 'path', 'polygon', 'image', 'text'];

  var parseXML = function(xmlString) {
    var xmlDoc;

    if (window.DOMParser) {
      xmlDoc = (new DOMParser()).parseFromString(xmlString, "text/xml");
    } else {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = "false";
      xmlDoc.loadXML(xmlString);
    }

    return xmlDoc;
  };

  var indexAttributes = function(namedNodeMap) {
    var map = {};
    var attribute;
    for (var i = 0; i < namedNodeMap.length; i++) {
      attribute = namedNodeMap[i];
      map[attribute.name] = attribute.value;
    }
    return map;
  };

  var scan = function(s, pattern, iterator) {
    if (!pattern.global) { throw "Global flag must be set." }
    var match;
    while ((match = pattern.exec(s)) != null) {
      iterator(match);
    }
  };

  var doc = parseXML(svg);
  var paper = this;

  for (var tagIndex = 0; tagIndex < svgTags.length; tagIndex++) {
    var tagName = svgTags[tagIndex];

    var elements = doc.getElementsByTagName(tagName);
    var element, attr, shape, style;

    for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
      element = elements[elementIndex];
      attr = indexAttributes(element.attributes);

      if (style = attr['style']) {
        scan(style, /([a-z\-]+) ?: ?([^ ;]+)[ ;]?/g, function(m) {
          attr[m[1]] = m[2];
        });
        delete attr['style'];
      }

      switch(tagName) {
        case "rect":
          shape = paper.rect();
        break;
        case "circle":
          shape = paper.circle();
        break;
        case "ellipse":
          shape = paper.ellipse();
        break;
        case "path":
          shape = paper.path(attr["d"]);
        break;
        case "polygon":
          shape = paper.polygon(attr["points"]);
        break;
        case "image":
          shape = paper.image();
        break;
      };

      var onClickJS;
      if (onClickJS = attr['onclick']) {
        shape.click(function(event) {
          eval(this.handler);
        }, { 'handler': onClickJS });
        delete attr['onclick'];
      }

      shape.attr(attr);
    };
  };
};

// extending raphael with a polygon function
Raphael.fn.polygon = function(point_string) {
  var poly_array = ["M"];
  $w(point_string).each(function(point, i) {
    point.split(",").each(function(c) {
      poly_array.push(parseFloat(c));
    });
    if (i == 0) poly_array.push("L");
  });
  poly_array.push("Z");
  return this.path(poly_array.compact());
};