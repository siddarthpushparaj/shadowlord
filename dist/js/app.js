window.Sl = {};
Sl.UI = {};


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
// https://github.com/remy/polyfills/blob/master/classList.js
(function () {

if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

var prototype = Array.prototype,
    push = prototype.push,
    splice = prototype.splice,
    join = prototype.join;

function DOMTokenList(el) {
  this.el = el;
  // The className needs to be trimmed and split on whitespace
  // to retrieve a list of classes.
  var classes = el.className.replace(/^\s+|\s+$/g,'').split(/\s+/);
  for (var i = 0; i < classes.length; i++) {
    push.call(this, classes[i]);
  }
};

DOMTokenList.prototype = {
  add: function(token) {
    if(this.contains(token)) return;
    push.call(this, token);
    this.el.className = this.toString();
  },
  contains: function(token) {
    return this.el.className.indexOf(token) != -1;
  },
  item: function(index) {
    return this[index] || null;
  },
  remove: function(token) {
    if (!this.contains(token)) return;
    for (var i = 0; i < this.length; i++) {
      if (this[i] == token) break;
    }
    splice.call(this, i, 1);
    this.el.className = this.toString();
  },
  toString: function() {
    return join.call(this, ' ');
  },
  toggle: function(token) {
    if (!this.contains(token)) {
      this.add(token);
    } else {
      this.remove(token);
    }

    return this.contains(token);
  }
};

window.DOMTokenList = DOMTokenList;

function defineElementGetter (obj, prop, getter) {
    if (Object.defineProperty) {
        Object.defineProperty(obj, prop,{
            get : getter
        });
    } else {
        obj.__defineGetter__(prop, getter);
    }
}

defineElementGetter(Element.prototype, 'classList', function () {
  return new DOMTokenList(this);
});

})();
Class(Sl.UI, 'Checkbox').inherits(Widget)({
    HTML : '\
        <div class="checkbox-wrapper">\
            <label>\
                <input type="checkbox">\
                <span class="checkbox-ui"></span>\
                <span class="checkbox-label"></span>\
            </label>\
        </div>\
        ',
    prototype : {
        id : null,
        checkbox : null,
        label : null,
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.checkbox = this.element.querySelector('[type="checkbox"]');
            this.label = this.element.querySelector('label');
            this.text = this.element.querySelector('.checkbox-label');

            this.checkbox.setAttribute('id', this.id);
            this.label.setAttribute('for', this.id);
            this.text.appendChild(document.createTextNode(this.id));

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this.checkbox.addEventListener('change', this._checkboxChangeHandler.bind(this), false);

            return this;
        },

        /*
         * Dispatch the 'change' event.
         * @property _checkboxChangeHandler <private> [Function]
         * @return undefined
         */
        _checkboxChangeHandler : function _checkboxChangeHandler() {
            this.constructor.dispatch('change', this);
        },

        /**
         * Toggle the status of the checkbox and dispatch it's 'change' event.
         * @property toggle <pubilc> [Function]
         * @return Sl.UI.Checkbox
         */
        toggle : function toggle() {
            this.checkbox.click();

            return this;
        },

        destroy : function destroy() {
            this.id = null;
            this.checkbox = null;
            this.label = null;

            Widget.prototype.destroy.call(this);
        }
    }
})

Class(Sl.UI, 'Color').inherits(Widget)({
    HTML : '\
        <div class="item">\
            <div class="item__inner">\
            </div>\
        </div>\
    ',

    prototype : {
        inner : null,
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.inner = this.element.querySelector('.item__inner');

            this.appendChild(new Sl.UI.Paragraph({
                name : 'hexLabel',
                className : 'hex--label'
            })).render(this.inner);

            this.appendChild(new Sl.UI.Paragraph({
                name : 'rgbLabel',
                className : 'rgb--label'
            })).render(this.inner);

            this.appendChild(new Sl.UI.Paragraph({
                name : 'hslLabel',
                className : 'hsl--label'
            })).render(this.inner);
        },

        /**
         * Return the DOM element reference.
         * @property getElement <public> [Function]
         * @return this.el [Object]
         */
        getElement : function getElement() {
            return this.element;
        },

        /**
         * Change the background-color of the element.
         * @property setBackgroundColor <public> [Function]
         * @argument color <required> [String]
         * @return Sl.UI.Color
         */
        setBackgroundColor : function setBackgroundColor(color) {
            this.element.style.backgroundColor = color;

            return this;
        },

        /**
         * Change the color of the element.
         * @property setColor <public> [Function]
         * @argument color <required> [String]
         * @return Sl.UI.Color
         */
        setColor : function setColor(color) {
            this.element.style.color = color;

            return this;
        },

        destroy : function destroy() {
            this.inner = null;
            Widget.prototype.destroy.call(this);

            return null;
        }
    }
})

Class(Sl.UI, 'ColorsCollection').inherits(Widget)({
    HTML : '\
        <div class="main-container" role="main-content">\
        </div>\
    ',
    prototype : {
        /**
         * Array to hold references to Sl.UI.Color instances.
         * @property _cached <private> [Array]
         */
        _cached : null,
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this._cached = [];
            this._storeInMemory(100);
        },

        /**
         * Store color instances in variables.
         * @property _storeInMemory <private> [Function]
         * @argument number_items <require> [Number] How many items to create.
         * @return Sl.UI.ColorsCollection
         */
        _storeInMemory : function _storeInMemory(number_items) {
            var i;

            for (i = 0; i < number_items; i++) {
                this._cached.push(new Sl.UI.Color());
            }

            return this;
        },

        /**
         * Return the DOM element reference.
         * @property getElement <public> [Function]
         * @return this.el [Object]
         */
        getElement : function getElement() {
            return this.element;
        },

        /**
         * Append and render Sl.UI.Color instances.
         * @property renderColors <public> [Function]
         * @return Sl.UI.ColorsCollection
         */
        renderColors : function renderColors() {
            this._cached.forEach(function(child) {
                this.appendChild(child).render(this.element);
            }, this);

            return this;
        }
    }
})

Class(Sl.UI, 'CreditsModal').inherits(Widget)({
    HTML : '\
        <div class="modal credits">\
          <div class="modal__wrapper">\
            <div class="modal__inner">\
              <button class="btn borderless modal__close">&#10062;</button>\
              <section>\
                <h3>About</h3>\
                <p>\
                    Tints and shades generator made by Noel Delgado –&nbsp;\
                    <a href="http://twitter.com/pixelia_me" target="_blank">\
                        @pixelia_me\
                    </a>.\
                </p>\
                <p>\
                    Build using <a href="https://github.com/azendal/neon" target="_blank">Neon<a/>&nbsp;\
                    by Fernando Trasviña and&nbsp;\
                    <a href="https://github.com/noeldelgado/values.js" target="_blank">Values.js</a>\
                <p>\
                    Entypo pictograms by Daniel Bruce –&nbsp;\
                    <a href="http://www.entypo.com" target="_blank">\
                        http://www.entypo.com\
                    </a>\
                </p>\
              </section>\
            </div>\
          </div>\
        </div>\
        ',
    prototype : {
        _doc : null,
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this._doc = document;
            this.closeModal = this.element.querySelector('.modal__close');

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._doc.addEventListener('keydown', this._keyDownHandler.bind(this), false);

            this.element.addEventListener('click', function(event) {
                this._checkBeforeClose(event);
            }.bind(this), false);

            this.closeModal.addEventListener('click', this.deactivate.bind(this), false);

            return this;
        },

        _keyDownHandler : function _keyDownHandler(e) {
            if (e.which === 27) {
                this.deactivate();
            }
        },

        _checkBeforeClose : function _checkBeforeClose(event) {
            if (event.target.classList.contains('modal__wrapper')) {
                this.deactivate();
            }

            return this;
        },

        destroy : function destroy() {
            this.closeModal = null;
            Widget.prototype.destroy.call(this);
        }
    }
})

Class(Sl.UI, 'Paragraph').inherits(Widget)({
    HTML : '<p></p>',
    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
        },

        /**
         * Return the DOM element reference.
         * @property getElement <public> [Function]
         * @return this.el [Object]
         */
        getElement : function getElement() {
            return this.element;
        },

        /**
         * Change the text of the element.
         * @property setText <public> [Function]
         * @argument text <optional> [String]
         * @return Sl.UI.Paragraph
         */
        setText : function setText(text) {
            this.element.textContent = text;

            return this;
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            return null;
        }
    }
})

Class(Sl, 'App').includes(CustomEventSupport, NodeSupport)({
    prototype : {
        _body : null,
        _values : null,
        _hash : null,
        _ui : null,
        init : function init() {
            this._body = document.body;
            this._hash = window.location.hash;
            this._ui = {
                colorPicker : document.querySelector('[type="color"]'),
                preview : document.querySelector('.preview__color'),
                optionsWrapper : document.querySelector('.options-wrapper'),
                input : document.querySelector('[name="input"]'),
                randomColorBtn : document.querySelector('.random-color-btn'),
                creditsBtn : document.querySelector('.credits-btn'),
            }
        },

        /**
         * Boot the little app.
         * @property run <public> [Function]
         * @return Sl.App [Object]
         */
        run : function run() {
            var color;

            if (this._isValidColorModel(this._hash)) {
                color = this._hash;
            } else {
                color = this._getRandomHexColor();
            }

            this._values = new Values();

            this.appendChild(new Sl.UI.Checkbox({
                name : 'checkboxHex',
                id : 'hex'
            }));

            this.appendChild(new Sl.UI.Checkbox({
                name : 'checkboxRgb',
                id : 'rgb'
            }));

            this.appendChild(new Sl.UI.Checkbox({
                name : 'checkboxHsl',
                id : 'hsl'
            }));

            this.appendChild(new Sl.UI.ColorsCollection({
                name : 'colorsContainer'
            }));

            this.appendChild(new Sl.UI.CreditsModal({
                name : 'creditsModal'
            }));

            this.checkboxHex.render(this._ui.optionsWrapper);
            this.checkboxRgb.render(this._ui.optionsWrapper);
            this.checkboxHsl.render(this._ui.optionsWrapper);
            this.colorsContainer.renderColors().render(this._body, this._body.querySelector('footer'));
            this.creditsModal.render(this._body);
            this.updateUI(color);
            this._bindEvents();

            this.checkboxHex.toggle();
            this.checkboxRgb.toggle();

            return this;
        },

        _bindEvents : function _bindEvents() {
            window.addEventListener('hashchange', this._hashChangeHandler.bind(this), false);
            this._ui.preview.addEventListener("click", this._previewClickHandler.bind(this));
            this._ui.colorPicker.addEventListener("change", this._colorPickerChangeHandler.bind(this));
            this._ui.input.addEventListener("keypress", this._inputKeypressHandler.bind(this), false);
            this._ui.input.addEventListener("click", function(event) {
                event.target.select();
            }.bind(this));
            this._ui.randomColorBtn.addEventListener('click', this._randomColorClickHandler.bind(this));
            this._ui.creditsBtn.addEventListener("click", this._creditsClickHandler.bind(this));

            Sl.UI.Checkbox.bind('change', function(data) {
                this._checkboxChangeHandler.call(this, data.checkbox);
            }.bind(this));

            this.creditsModal.bind('render', function() {
                var app = this;

                setTimeout(function() {
                    app.creditsModal.activate();
                }, 0);
            }.bind(this));

            return this;
        },

        /**
         * Compare the current color vs the hexadecimal color code represented
         * by the hash. If they are different then the ui is updated with the
         * color holded on the hash.
         * @property _hashChangeHandler <private> [Function]
         * @return Sl.App [Object]
         */
        _hashChangeHandler : function _hashChangeHandler() {
            var newColor = window.location.hash;

            if (this._hash !== newColor) {
                if (this._isValidColorModel(newColor)) {
                    this.updateUI(newColor);
                }
            }

            newColor = null;

            return this;
        },

        /**
         * For browser that support the color input type, a native color picker
         * will be displayed so we can select a color.
         * @property _previewClickHandler <private> [Function]
         * @return Sl.App [Object]
         */
        _previewClickHandler : function _previewClickHandler() {
            this._ui.colorPicker.click();

            return this;
        },

        /**
         * Get the current color holded as value on the color-picker an update
         * the ui using that color as new value.
         * @property _colorPickerChangeHandler <private> [Function]
         * @return Sl.App [Object]
         */
        _colorPickerChangeHandler : function _colorPickerChangeHandler() {
            this.updateUI(this._ui.colorPicker.value);

            return this;
        },

        /*
         * Checks if the text typed on the input is a valid hex or rgb color.
         * If so the ui is updated with that color, otherwhise an 'error'
         * css-class is added to the input to show feedback.
         * @property _inputKeypressHandler <private> [Function]
         * @return Sl.App [Object]
         */
        _inputKeypressHandler : function _inputKeypressHandler(e) {
            var charCode, newColor;

           charCode = (typeof e.which === "number") ? e.which : e.keyCode;

            if (charCode === 13) {
                newColor = this._ui.input.value;

                if (this._isValidColorModel(newColor)) {
                    this.updateUI(newColor);
                    this._ui.input.classList.remove('error');
                } else {
                    this._ui.input.classList.add('error');
                }
            }

            charCode = newColor = null;

            return this;
        },

        /**
         * Render the creditsModal.
         * @property _creditsClickHandler <private> [Function]
         * @return Sl.App [Object]
         */
        _creditsClickHandler : function _creditsClickHandler(ev) {
            ev.preventDefault();
            this.creditsModal.activate();

            return this;
        },

        /**
         * Update the ui with a new random color.
         * @property _randomColorClickHandler <private> [Function]
         * @return Sl.App [Object]
         */
        _randomColorClickHandler : function _randomColorClickHandler(event) {
            return this.updateUI(this._getRandomHexColor());
        },

        /**
         * Handle the change event dispached by the checkbox widgets.
         * @property _checkboxChangeHandler <private> [Function]
         * @argument element <required> [DOMElement]
         * @return undefined
         */
        _checkboxChangeHandler : function _checkboxChangeHandler(element) {
            var className, isChecked, action;

            className = 'show--' + element.id;
            isChecked = element.checked;
            action = isChecked ? 'add' : 'remove';

            this.colorsContainer.getElement().classList[action](className);

            className = isChecked = action = null;
        },

        /**
         * Checks if the String is a valid hex or rgb color model using
         * the helper methods provided by Values.js
         * @property _isValidColorModel <private> [Function]
         * @argument color <required> [String]
         * @return true|false [Boolean]
         */
        _isValidColorModel : function _isValidColorModel(color) {
            if (Values.Utils.isHEX(color)) return true;
            if (Values.Utils.isRGB(color)) return true;
            if (Values.Utils.isHSL(color)) return true;

            return false;
        },

        /**
         * Updates the hash with the passed argument.
         * @property _updateHash <private> [Function]
         * @argument hash <required> [String]
         * @return Sl.App [Object]
         */
        _updateHash : function _updateHash(hash) {
            this._hash = window.location.hash = hash;

            return this;
        },

        /**
         * Return a valid random hexadecimal color code.
         * @property _getRandomHexColor <public> [Function]
         * @return #000000 [String]
         */
        _getRandomHexColor : function _getRandomHexColor() {
            return "#" +  Math.random().toString(16).slice(2, 8);
        },

        /**
         * Update the whole UI with a the passed color as param.
         * @property updateUI <public> [Function]
         * @argument color <required> [String] A valid hexadecimal color code.
         * @return Sl.App [Object]
         */
        updateUI : function updateUI(color) {
            var baseColor;

            this._values.setColor(color);
            this._updateHash(this._values.hex.toUpperCase());
            this._ui.preview.style.backgroundColor = this._values.hex;
            this._ui.colorPicker.value = this._values.hex;
            this._ui.input.value = this._values.hex;

            this.colorsContainer.children.forEach(function(child, index) {
                var value, textColor, element;

                value = this._values.all[index];
                textColor = (value.brightness > 50) ? '#000' : '#fff';
                element = child.getElement();

                element.classList.remove("original");

                if (value.hex === this._values.hex) {
                    element.classList.add("original");
                    baseColor = element;
                }

                child.setBackgroundColor(value.hex).setColor(textColor);
                child.hexLabel.setText(value.hex);
                child.rgbLabel.setText(value.rgb);
                child.hslLabel.setText(value.hsl);

                value = textColor = element = null;
            }, this);

            this._body.scrollTop = 0;

            if (baseColor !== undefined) {
                this._body.scrollTop = (baseColor.getBoundingClientRect().top - 80);
            }

            baseColor = null;

            return this;
        },

        destroy : function destroy() {
            this._body = null;
            this._values = null;
            this._hash = null;
            this._ui = null;

            Widget.prototype.destroy.call(this);
        }
    }
});

(function() {
    Shadowlord = new Sl.App();
    Shadowlord.run();
})();
