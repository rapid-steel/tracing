


class Toolbar {

  constructor( app ) {
    this.app = app;
    this.$els = {};
    this.$controls = {};
    this.$inputs = {};
  }

  init( ) {
    this.$els = {
      setPointOn: $('.setPointOn'),
      setPointOff: $('.setPointOff'),
      addPoint: $('.addPoint'),
      editPoint: $('.editPoint'),
      addLine: $('.addLine'),
    };

    this.$controls = {
      appMode: $('.appMode'),
        toolbarControl: $('.toolbar-control'),
        addPoint: $('#addPoint'),
        editPoint: $('#editPoint'),
        deletePoint: $('#deletePoint'),
        deleteLine: $('#deleteLine'),
        selectLine: $('#selectLine'),
    };

    this.$inputs = {
        toolbarInput: $('.toolbar-input'),
        origin: $('.origin'),
        label: $('.labelAxis'),
        unit: $('.unit'),
        pointsVal: $('.pointsVal'),

        pointXadd: $('#pointXadd'),
        pointYadd: $('#pointYadd'),
        pointXedit: $('#pointXedit'),
        pointYedit: $('#pointYedit'),

        lineName: $('#nameL'),
        newLineName: $('#newLineName'),

        originX: $('#originX'),
        originY: $('#originY'),
        labelX: $('#labelX'),
        labelY: $('#labelY'),
        unitX: $('#unitX'),
        unitY: $('#unitY'),
        pointsValX: $('#pointsValX'),
        pointsValY: $('#pointsValY')

    };

    this.$controls.selectLine.selectBoxIt();
    this.selectBox =  this.$controls.selectLine.data('selectBox-selectBoxIt');

    this.delegateEvents();
  };

  saveAxisPoint( ) {
    if ( this.app.axes.axisPoint && this.$inputs.pointPosition.val() ) {
      this.app.axes.setScale( this.$inputs.pointPosition.val() );
      this.app.axes.correctSizes();
      this.app.axes.render();
    }
  };

  changeAppMode( mode ) {
    this.app.mode = mode;
    if ( this.app.mode === 'plot')
      this.app.axes.correctSizes();
    this.app.render();
  };

  changeMode( mode ) {
    this.app.editMode = mode;
    this.app.svg.classed('crosshair', this.app.editMode === 'line');
    this.switchEditMode();
  };

  setOrigin( event ) {
    this.app.setOrigins([ this.$inputs.originX.val(), this.$inputs.originY.val() ]);
  };

  setLabel( event ) {
    let val = $( event.target ).val();
    let axis = $( event.target ).attr('id').slice( 5 ).toLowerCase();

    this.app.axes.label[ axis ] = val;
    this.app.axes.render();
  };

  setUnit( event ) {
    let val = $( event.target ).val();
    let axis = $( event.target ).attr('id').slice( 4 ).toLowerCase();

    this.app.axes.unit[ axis ] = val;
    this.app.axes.render();
  };

  setPointsVal( event ) {
    let val = $( event.target ).val();
    let axis = $( event.target ).attr('id').slice( 9 ).toLowerCase();

    this.app.axes.setScale( val, axis );
    this.app.axes.render();
  };

  setName() {
    this.app.lines[ this.app.currentLine ].name = this.$inputs.lineName.val();
    this.renderLinesSection();
  };

  addLine() {
    let name = this.$inputs.newLineName.val();
    this.app.addLine( name );
    this.$inputs.newLineName.val('');
  };

  changeLine() {
    this.app.currentLine = this.$controls.selectLine.val();
    this.renderLinesSection();
  };

  deleteLine() {
    this.app.lines[ this.app.currentLine ].remove();
    this.app.lines.splice( this.app.currentLine, 1 );
    if( this.app.lines.length === this.app.currentLine )
      this.app.currentLine--;

    this.app.lines[  this.app.currentLine ].render();
    this.renderPointSection();
    this.renderLinesSection();
  };

  addPoint() {
    let x = parseFloat( this.$inputs.pointXadd.val() ),
        y = parseFloat( this.$inputs.pointYadd.val() );

    if ( x && y ) {
      this.app.addPoint([
        this.app.axes.scale.x( x ) + this.app.axes.origin.x,
        this.app.axes.scale.y( y ) + this.app.axes.origin.y
      ]);

      this.$inputs.pointXadd.val('');
      this.$inputs.pointYadd.val('');
    }
  };

  editPoint() {
    let x = parseFloat( this.$inputs.pointXedit.val() ),
        y = parseFloat( this.$inputs.pointYedit.val() );

    if ( x && y ) {
      this.app.lines[ this.app.currentLine ].points[ this.app.currentPoint ] =
        [ this.app.axes.scale.x( x ) + this.app.axes.origin.x,
          this.app.axes.scale.y( y ) + this.app.axes.origin.y ];

      this.app.lines[ this.app.currentLine ].render();
      this.renderPointSection();
    }
  };

  deletePoint() {
    this.app.lines[ this.app.currentLine ].deletePoint( this.app.currentPoint );
    this.app.currentPoint = false;

    this.app.lines[  currentLine ].render();
    this.renderPointSection();
  };

  setAxisPoint() {
    this.changeMode('axis');
  };

  cancelAxisPoint() {
    this.changeMode('line');
  };


  send() {
    this.app.send();
  };

  delegateEvents() {

    this.$controls.appMode.on('click', event => {
      let mode = event.target.id.slice( 0, 4 );
      this.changeAppMode( mode );
    });

    this.$controls.toolbarControl.on('click', event => {
      let action = event.target.id;
      this[ action ]();
    });

    ['addPoint', 'editPoint', 'addLine'].forEach( className => {
      this.$els[ className ].on('keydown', event => {
        if ( event.originalEvent.key === 'Enter' )
          this[ className ]();
      });
    });



    this.$controls.selectLine.on('change',
      () => this.changeLine() );

    this.$inputs.toolbarInput.on('change', event => {
      let prop = event.target.id;
      let action = 'set' + prop.slice( 0, 1 ).toUpperCase()
        + prop.slice( 1, -1 );

      this[ action ]( event );
    });

  };

  switchEditMode() {
    this.$els.setPointOn.css( 'display',
      this.app.editMode === 'axis'
        ? 'block'
        : 'none');
    this.$els.setPointOff.css('display',
      this.app.editMode === 'line'
        ? 'block'
        : 'none');

    this.app.axes.render();
  };

  renderPointSection() {

    if( this.app.currentPoint !== false ) {
      this.$els.editPoint.show();
      this.$els.addPoint.hide();

      ['x', 'y'].forEach( axis =>
        this.$inputs[ `point${axis.toUpperCase()}edit` ].val(
          this.app.axes.scale[ axis ].invert(
            this.app.lines[ this.app.currentLine ].points[ this.app.currentPoint ][0]
            - this.app.axes.origin[ axis ] )) );

    } else {
      this.$els.addPoint.show();
      this.$els.editPoint.hide();
    }
  };

  renderLinesSection() {

    this.$inputs.lineName.val( this.app.lines[this.app.currentLine].name );
    this.$controls.deleteLine.attr('disabled', this.app.lines.length < 2 );

    this.$controls.selectLine.empty();

    this.app.lines.forEach( (line, index) => {

      let option = `
          <option value="${index}" data-text='
            <span>
              <b style="color: ${ line.color }!important">&#9679;</b>  
              ${line.name}
            </span>'>                   
          </option>`;

      this.$controls.selectLine.append( option );
    });

    this.$controls.selectLine.val( this.app.currentLine );
    this.selectBox.refresh();
  };

  renderAxesSection() {

    ['origin', 'label', 'unit', 'pointsVal'].forEach( param => {
      ['x', 'y'].forEach( axis =>
        this.$inputs[ `${param}${axis.toUpperCase()}` ].val( this.app.axes[ param ][ axis ] ));
    });
    this.$inputs.originY.val( this.app.sizes.height - this.app.axes.origin.y );

    this.switchEditMode();
  };

  render() {

    this.$controls.appMode.each( c => {
      let $control = $( this.$controls.appMode[ c ] );
      let idMode = $control.attr('id').slice( 0, 4 );

      idMode === this.app.mode
        ? $control.removeClass('btn-outline-primary')
        : $control.addClass('btn-outline-primary');
    });

    this.renderPointSection();
    this.renderAxesSection();
    this.renderLinesSection();
  }
}