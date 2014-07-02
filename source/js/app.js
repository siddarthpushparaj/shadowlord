Class(UI, 'App').inherits(Widget)({
    prototype : {

        values          : null,
        current_color   : null,
        step            : 1,
        hash            : window.location.hash,

        init : function init() {
            this.ui = {
                colorPicker     : document.querySelector('[type="color"]'),
                preview         : document.querySelector('.preview__color'),
                checkboxes      : document.querySelectorAll('[type="checkbox"]'),
                input           : document.querySelector('[name="input"]'),
                randomColorBtn  : document.querySelector('.random-color-btn'),
                creditsBtn      : document.querySelector('.credits-btn'),
                creditsModal    : document.querySelector('.modal.credits'),
                closeModal      : document.querySelector('.modal__close')
            }

            this.colors = new UI.ColorsCollection({
                name    : 'colors',
                element : document.querySelector('.main-container')
            });

            this.ui.checkboxes[0].checked = true; // hex
            this.ui.checkboxes[1].checked = true; // rgba
            this.checkboxUpdated(this.ui.checkboxes[0]);
            this.checkboxUpdated(this.ui.checkboxes[1]);

            var color = (this._isValidColorModel(this.hash)) ? this.hash : this.generateRandomColor();

            this.values = new Values(color).setStep(this.step);
            this.printValues(color);

            this.bindings();
            color = null;
        },

        generateRandomColor : function generateRandomColor() {
            return "#" +  Math.random().toString(16).slice(2, 8);
        },

        bindings : function bindings() {
            window.addEventListener('hashchange', this.checkHash.bind(this), false);
            this.ui.preview.addEventListener("click", this.showColorPicker.bind(this), false);
            this.ui.colorPicker.addEventListener("change", this.colorPickerUpdated.bind(this), false);
            this.ui.input.addEventListener("keypress", this.checkInput.bind(this), false);
            this.ui.randomColorBtn.addEventListener('click', this.randomColor.bind(this), false);
            this.ui.creditsBtn.addEventListener("click", this.showModal.bind(this), false);
            this.ui.creditsModal.addEventListener("click", this.checkBeforeCloseModal.bind(this), false);
            this.ui.closeModal.addEventListener('click', this.closeModal.bind(this), false);
            for (var i = 0, cbl = this.ui.checkboxes.length; i < cbl; i++) {
                this.ui.checkboxes[i].addEventListener('change', this.checkboxUpdated.bind(this, this.ui.checkboxes[i]), false);
            }
        },

        _isValidColorModel : function _isValidColorModel(color) {
            if (Values.Utils.isHEX(color)) return true;
            if (Values.Utils.isRGB(color)) return true;
            return false;
        },

        checkHash : function checkHash(e) {
            var new_color = window.location.hash;
            if (this.hash !== new_color) {
                if (this._isValidColorModel(new_color))
                    this.printValues(new_color);
            }
            new_color = null;
        },

        showColorPicker : function showColorPicker() {
            this.ui.colorPicker.click();
        },

        colorPickerUpdated : function colorPickerUpdated() {
            this.printValues(this.ui.colorPicker.value);
        },

        checkInput : function checkInput(event) {
            if (event.charCode === 13) {
                var new_color = this.ui.input.value;
                if (this._isValidColorModel(new_color)) {
                    this.printValues(new_color);
                    this.ui.input.classList.remove('error');
                } else this.ui.input.classList.add('error');
                new_color = null;
            }
        },

        showModal : function showModal(event) {
            event.preventDefault();
            this.ui.creditsModal.classList.add('active');
        },

        closeModal : function closeModal() {
            this.ui.creditsModal.classList.remove('active');
        },

        checkBeforeCloseModal : function checkBeforeCloseModal(event) {
            if (event.target.classList.contains('modal__wrapper')) {
                this.closeModal();
            }
        },

        randomColor : function randomColor(event) {
            this.printValues(this.generateRandomColor());
        },

        checkboxUpdated : function checkboxUpdated(element, event) {
            var classname = 'show--' + element.id;
            this.colors.element.classList[element.checked ? 'add' : 'remove'](classname);
            classname = null;
        },

        printValues : function printValues(color) {
            var _this   = this,
                original;

            this.values.setColor(color);
            this.current_color = this.values.hex;

            this.updateHash(this.values.hex.toUpperCase());
            this.updateUI();

            this.colors.children.forEach(function(child, i) {
                var item    = _this.colors.children[i],
                    value   = _this.values.all[i],
                    tc      = (value.brightness > 50) ? '#000' : '#fff';

                item.element.classList.remove("original");

                if (value.hex === _this.values.hex) {
                    item.element.classList.add("original");
                    original = item.element;
                }

                item.element.style.backgroundColor = value.hex;
                item.inner.style.color = tc;
                item.hexLabel.textContent = value.hex;
                item.rgbLabel.textContent = value.rgba;
                item.hslLabel.textContent = value.hsla;
            });

            this.colors.element.scrollTop = 0;
            if (original !== undefined)
                this.colors.element.scrollTop = (original.getBoundingClientRect().top - 225);
            values = original = null;
            return this;
        },

        updateUI : function updateUI() {
            this.ui.preview.style.backgroundColor = this.current_color;
            this.ui.colorPicker.value = this.current_color;
            this.ui.input.value = this.current_color;
        },

        updateHash : function updateHash(hash) {
            window.location.hash = hash;
            this.hash = hash;
            return this;
        }
    }
});
