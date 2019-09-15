import IonSlider from '../mixins/ion-slider';
import { get } from '@ember/object';
import { observer } from '@ember/object';
import { merge } from '@ember/polyfills';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { bind, debounce } from '@ember/runloop';

export default Component.extend(IonSlider, {
  tagName: 'input',
  classNames: ['ember-ion-rangeslider'],
  type: 'single', //## explicit, waiting for this.attr.type
  _slider: null,

  sliderOptions: computed(function(){
    //## Update trigger: change|finish
    var updateTrigger = get(this, 'updateTrigger') || 'finish',
        throttleTimeout = get(this, 'throttleTimeout') || 50,
        to = get(this, 'to'),
        from = get(this, 'from'),
        options = {
          to: 10,
          from: 100,
          onChange() {},
          onFinish: bind(this, '_sliderDidFinish'),
        };

    if (from || from === 0) {
      options.from = from
    }
    if (to || to === 0) {
      options.to = to
    }
    //## Setup change update trigger
    if (updateTrigger === 'change') {
      options.onChange = bind(this, '_sliderDidChange', throttleTimeout);
      options.onFinish = function() {};
    }
    merge(options, this.get('ionReadOnlyOptions'));
    return options;
  }).readOnly(),

  //## Setup/destroy
  didInsertElement(){
    var options = get(this, 'sliderOptions');
    this.$().ionRangeSlider(options);
    this._slider = this.$().data('ionRangeSlider');
  },

  willDestroyElement(){
    this._slider.destroy();
  },

  //## Bound values observers
  _onToFromPropertiesChanged: observer(
    'to', 'from',
    function(){
      var propName = arguments[1];

      //## slider.update removes the focus from the currently active element.
      //## In case where multiple sliders bound to the same property
      //## don't update the active slider values (to/from) as it results in a
      //## a loss of focus in a currently active slider
      if(this._slider && !this._slider.is_active){
        this._slider.update(this.getProperties(propName));
      }
  }),

  _readOnlyPropertiesChanged: function(){
    this._slider.update(this.getProperties(arguments[1]));
  },

  _sliderDidChange: function(throttleTimeout, changes){
    var args = {'to': changes.to, 'from': changes.from };
    debounce(this, this.setProperties, args, throttleTimeout);
  },
  _sliderDidFinish: function(changes){
    this.setProperties({'to': changes.to, 'from': changes.from});
  },
});
