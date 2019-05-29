/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-template */
import {
  ClassName,
  LocationMapping,
  RulerDirections,
  Units,
} from './util';

/**
  * util class containing the ruler calculation methods
  */
export class DocumentRuler {
  /**
  *
  * @param {Object} options may contain:
  * @param {Object} options.viewer an osd viewer instance
  * @param {string} options.location the ruler's location
  * @param {number} options.smallDashSize the size for the ruler's small dashes
  * @param {number} options.largeDashSize the size for the ruler's large dashes
  * @param {number} options.pixelsPerMillimeter the pixels per millimeter
  * @param {number} options.labelsEvery the repetation frequency of the label
  * @param {string} options.color the color to use
  * @param {number} options.labelPrecision the label's precision
  * @param {boolean} options.show whether show the ruler initially or not
  * @param {boolean} options.imperialUnits whether to use imperial units or not
  */
  constructor(options) {
    // eslint-disable-next-line no-param-reassign
    options = options || {};
    if (!options.viewer) {
      throw new Error('A viewer must be specified.');
    }

    // Set up instance state
    this.viewer = options.viewer;
    this.location = LocationMapping[options.location || 'bottom-left'];
    this.smallDashSize = options.smallDashSize || 10;
    this.largeDashSize = options.largeDashSize || 15;
    this.pixelsPerMillimeter = options.pixelsPerMillimeter;
    this.labelsEvery = options.labelsEvery || 5;
    this.imperialUnits = options.imperialUnits || false;
    this.color = options.color || '#ffffff';
    this.labelPrecision = options.labelPrecision || 3;

    this.canvas = document.createElement('canvas', null, null);
    this.elements = {
      horizontal: this.makeRulerElements(RulerDirections.HORIZONTAL),
      unit: this.makeUnitElement(),
      vertical: this.makeRulerElements(RulerDirections.VERTICAL),
    };

    this.parentElement = document.createElement('div');
    this.parentElement.className = ClassName;
    this.parentElement.appendChild(this.elements.horizontal.ruler);
    this.parentElement.appendChild(this.elements.vertical.ruler);
    this.parentElement.appendChild(this.elements.unit);
    this.viewer.container.appendChild(this.parentElement);
    // ToDo use class
    this.parentElement.style.visibility = options.show ? 'visible' : 'hidden';
  }

  /**
   * setter for the pixelsPerMillimeter property
   */
  get PixelsPerMillimeter() {
    return this.pixelsPerMillimeter;
  }

  /**
   * getter for the pixelsPerMillimeter property
   */
  set PixelsPerMillimeter(val) {
    this.pixelsPerMillimeter = val;
  }

  /**
   *
   * @param {*} tiledImage a tiled image ressource
   */
  refresh(tiledImage) {
    if (tiledImage && tiledImage.viewportToImageZoom && tiledImage !== this.tiledImage) {
      this.tiledImage = tiledImage;
    }

    if (this.tiledImage) {
      const { viewport } = this.viewer;
      const zoom = this.tiledImage.viewportToImageZoom(viewport.getZoom(true));
      const currentPixelsPerMillimeter = zoom * this.pixelsPerMillimeter;
      this.updateScales(currentPixelsPerMillimeter);
    }
  }

  /**
   * Update the scales with the new pixelsPerMillimeter value
   */
  updateScales(pixelsPerMillimeter) {
    const scaleInfo = this.getScalesInfo(pixelsPerMillimeter);

    this.elements.horizontal.small.style.backgroundSize = Math.round(scaleInfo.small) + 'px 100%';
    this.elements.horizontal.large.style.backgroundSize = Math.round(scaleInfo.small) * scaleInfo.largeFactor + 'px 100%';
    this.elements.vertical.small.style.backgroundSize = '100% ' + Math.round(scaleInfo.small) + 'px';
    this.elements.vertical.large.style.backgroundSize = '100% ' + Math.round(scaleInfo.small) * scaleInfo.largeFactor + 'px';

    if (this.elements.unit.text !== scaleInfo.unit) {
      this.elements.unit.textContent = scaleInfo.unit;
    }

    this.updateLabels(RulerDirections.HORIZONTAL, scaleInfo);
    this.updateLabels(RulerDirections.VERTICAL, scaleInfo);
  }

  /**
   *
   * @param {*} direction the label's direction
   * @param {*} scaleInfo scale info
   */
  updateLabels(direction, scaleInfo) {
    let numLabels;
    if (direction === RulerDirections.VERTICAL) {
      // eslint-disable-next-line max-len
      numLabels = Math.ceil(this.viewer.viewport.containerSize.y / (Math.round(scaleInfo.small) * scaleInfo.largeFactor) / this.labelsEvery);
    } else {
      // eslint-disable-next-line max-len
      numLabels = Math.ceil(this.viewer.viewport.containerSize.x / (Math.round(scaleInfo.small) * scaleInfo.largeFactor) / this.labelsEvery);
    }

    const currentLabels = this.elements[direction].labels;
    if (currentLabels.length < numLabels) {
      while (currentLabels.length < numLabels) {
        const labelElement = document.createElement('span');
        labelElement.className = 'ruler-label';
        labelElement.style.color = this.color;
        labelElement.style.position = 'absolute';

        if (this.location[0] === 1 && direction === RulerDirections.HORIZONTAL) {
          labelElement.style.transform += ' scaleX(-1)';
        }
        if (this.location[1] === 1) {
          labelElement.style.transform += ' scaleY(-1)';
        }
        currentLabels.push(labelElement);
        this.elements[direction].ruler.appendChild(labelElement);
      }
    } else if (currentLabels.length > numLabels) {
      const numToRemove = currentLabels.length - numLabels;
      currentLabels.slice(-numToRemove).forEach((element) => {
        element.remove();
      });
      this.elements[direction].labels = currentLabels.slice(0, numLabels);
    }
    const textMeasureContext = this.canvas.getContext('2d');
    textMeasureContext.font = "'Open Sans', 'Lucida Grande', Verdana, Arial, sans-serif";
    currentLabels.forEach((label, idx) => {
      if (idx === 0) {
        return;
      }
      const labelNumber = idx * scaleInfo.labelFactor * this.labelsEvery;
      let text;

      if (labelNumber < 1e-4 || labelNumber > 1e4) {
        label.style.whiteSpace = 'nowrap';
        text = labelNumber.toExponential(this.labelPrecision);
      } else {
        text = Number(labelNumber.toFixed(this.labelPrecision));
      }

      if (direction === RulerDirections.VERTICAL) {
        const textHeight = 17;
        if (this.location[0] === 0) {
          label.style.left = this.largeDashSize * 1.5 + 'px';
        } else {
          label.style.right = this.largeDashSize * 1.5 + 'px';
        }

        const verticalMargin = (this.labelsEvery * idx * Math.round(scaleInfo.small) * scaleInfo.largeFactor - (textHeight / 2)) + 'px';
        label.style.top = verticalMargin;
      } else {
        const textWidth = textMeasureContext.measureText(text).width;
        const horizontalMargin = (this.labelsEvery * idx * Math.round(scaleInfo.small) * scaleInfo.largeFactor - (textWidth / 1)) + 'px';
        label.style.top = this.largeDashSize * 1.5 + 'px';
        label.style.left = horizontalMargin;
      }
      label.textContent = text;
    }, this);
  }

  /**
   * update size
   */
  updateSize() {
    this.elements.horizontal.small.style.width = this.viewer.viewport.containerSize.x + 'px';
    this.elements.horizontal.large.style.width = this.viewer.viewport.containerSize.x + 'px';
    this.elements.vertical.small.style.height = this.viewer.viewport.containerSize.y + 'px';
    this.elements.vertical.large.style.height = this.viewer.viewport.containerSize.y + 'px';
  }

  /**
   * unregister the previously registered handlers
   */
  unregister() {
    // ToDo call this and check if bind 'this' is necessary
    this.viewer.container.removeChild(this.parentElement);
    this.handlers.forEach((handler) => {
      this.viewer.removeHandler(handler);
    });
  }

  /**
   * enables to ruler, especially adding the handlers
   */
  register() {
    const self = this;
    this.handlers = [
      this.viewer.addHandler('open', () => {
        self.refresh();
        self.updateSize();
      }),
      this.viewer.addHandler('animation', () => {
        self.refresh();
      }),
      this.viewer.addHandler('resize', () => {
        self.refresh();
        self.updateSize();
      }),
    ];
  }

  /**
   * hide the ruler
   */
  hide() {
    this.parentElement.style.visibility = 'hidden';
  }

  /**
   * show the ruler
   */
  show() {
    this.parentElement.style.visibility = 'visible';
  }

  /**
   * create the element to show the unit
   */
  makeUnitElement() {
    const element = document.createElement('span', null, null);
    element.className = 'ruler-unit';

    const margin = (this.largeDashSize * 1.25) + 'px';
    element.style.position = 'absolute';

    if (this.location[0] === 0) {
      element.style.left = margin;
    } else {
      element.style.right = margin;
    }

    if (this.location[1] === 0) {
      element.style.top = margin;
    } else {
      element.style.bottom = margin;
    }
    element.style.color = this.color;
    return element;
  }

  /**
   * create the ruler element
   * @param {*} direction
   */
  makeRulerElements(direction) {
    // Basic styling for parent element
    const rulerElement = document.createElement('div', null, null);
    rulerElement.style.position = 'absolute';
    rulerElement.style.transition = 'all 0.1s ease-in';

    const smallScaleElement = document.createElement('div', null, null);
    smallScaleElement.style.position = 'absolute';
    smallScaleElement.style.backgroundRepeat = 'repeat';

    const largeScaleElement = document.createElement('div', null, null);
    largeScaleElement.style.position = 'absolute';
    largeScaleElement.style.backgroundRepeat = 'repeat';

    // Positioning
    if (this.location[0] === 0) { // left?
      if (direction === RulerDirections.HORIZONTAL) {
        rulerElement.style.marginLeft = this.largeDashSize + 'px';
      }
      rulerElement.style.left = 0;
    } else {
      if (direction === RulerDirections.HORIZONTAL) {
        rulerElement.style.marginRight = this.largeDashSize + 'px';
        rulerElement.style.transform += ' scaleX(-1)';
      } else {
        smallScaleElement.style.right = 0;
        largeScaleElement.style.right = 0;
      }
      rulerElement.style.right = 0;
    }
    if (this.location[1] === 0) { // top?
      if (direction === RulerDirections.VERTICAL) {
        rulerElement.style.marginTop = this.largeDashSize + 'px';
      }
      rulerElement.style.top = 0;
    } else {
      if (direction === RulerDirections.VERTICAL) {
        rulerElement.style.marginBottom = this.largeDashSize + 'px';
      }
      rulerElement.style.bottom = 0;
      rulerElement.style.transform += ' scaleY(-1)';
    }

    if (direction === RulerDirections.HORIZONTAL) {
      smallScaleElement.style.height = this.smallDashSize + 'px';
      smallScaleElement.style.backgroundImage = 'linear-gradient(to left, ' + this.color + ' 1px, rgba(0, 0, 0, 0) 0px)';
      smallScaleElement.style.backgroundImage = '-moz-linear-gradient(left, ' + this.color + ' 1px, rgba(0, 0, 0, 0) 0px)';
      smallScaleElement.style.backgroundImage = '-webkit-linear-gradient(left, ' + this.color + ' 1px, rgba(0, 0, 0, 0) 0px)';
      largeScaleElement.style.height = this.largeDashSize + 'px';
      largeScaleElement.style.backgroundImage = 'linear-gradient(to left, ' + this.color + ' 2px, rgba(0, 0, 0, 0) 0px)';
      largeScaleElement.style.backgroundImage = '-moz-linear-gradient(left, ' + this.color + ' 2px, rgba(0, 0, 0, 0) 0px)';
      largeScaleElement.style.backgroundImage = '-webkit-linear-gradient(left, ' + this.color + ' 2px, rgba(0, 0, 0, 0) 0px)';
    } else {
      smallScaleElement.style.width = this.smallDashSize + 'px';
      smallScaleElement.style.backgroundImage = 'linear-gradient(to top, ' + this.color + ' 1px, rgba(0, 0, 0, 0) 0px)';
      smallScaleElement.style.backgroundImage = '-moz-linear-gradient(top, ' + this.color + ' 1px, rgba(0, 0, 0, 0) 0px)';
      smallScaleElement.style.backgroundImage = '-webkit-linear-gradient(top, ' + this.color + ' 1px, rgba(0, 0, 0, 0) 0px)';
      largeScaleElement.style.width = this.largeDashSize + 'px';
      largeScaleElement.style.backgroundImage = 'linear-gradient(to top, ' + this.color + ' 2px, rgba(0, 0, 0, 0) 0px)';
      largeScaleElement.style.backgroundImage = '-moz-linear-gradient(top, ' + this.color + ' 2px, rgba(0, 0, 0, 0) 0px)';
      largeScaleElement.style.backgroundImage = '-webkit-linear-gradient(top, ' + this.color + ' 2px, rgba(0, 0, 0, 0) 0px)';
    }
    rulerElement.appendChild(smallScaleElement);
    rulerElement.appendChild(largeScaleElement);

    return {
      labels: [],
      large: largeScaleElement,
      ruler: rulerElement,
      small: smallScaleElement,
    };
  }

  /** Return the pixel steps for the small and large scales, the factor
   *  used for the labels on the large scale as well as the unit to display. */
  getScalesInfo(pixelsPerMillimeter) {
    /**
     * calculates the numver of pixels for the small
     * @param {*} conversionFactor
     * @param {*} largeFactor
     * @param {*} labelFactor
     */
    const getPixelsPerSmallDash = (conversionFactor, largeFactor, labelFactor) => ((conversionFactor * pixelsPerMillimeter * labelFactor) / largeFactor);

    /**
     * calculates the scaling factor
     */
    const getLargeFactor = (unitDef, labelFactor) => {
      if (this.imperialUnits && unitDef.unit === 'in' && labelFactor === 1) {
        return 8;
      }
      return 10;
    };

    const units = this.imperialUnits ? Units.imperial : Units.metric;

    const unitDefinition = units.find((unitDef) => {
      const labelFactor = unitDef.labelFactors.slice(-1)[0];
      const largeFactor = getLargeFactor(unitDef, labelFactor);
      return getPixelsPerSmallDash(unitDef.conversionFactor, largeFactor, labelFactor) > 2;
    });

    const labelFactor = unitDefinition.labelFactors.find((factor) => {
      const largeFactor = getLargeFactor(unitDefinition, factor);
      return getPixelsPerSmallDash(unitDefinition.conversionFactor, largeFactor, factor) > 2;
    });

    const largeFactor = getLargeFactor(unitDefinition, labelFactor);
    const ret = {
      labelFactor,
      largeFactor,
      small: unitDefinition.conversionFactor * labelFactor * pixelsPerMillimeter * (1 / largeFactor),
      unit: unitDefinition.unit,
    };
    return ret;
  }
}
