
class Toolbar {

  constructor( app ) {
    this.app = app;
    this.$els = {};
    this.$controls = {};
    this.$inputs = {};
  }

  init( ) {
    this.$els = {
      addPlot: $('.addPlot'),
      addPoint: $('.addPoint'),
      editPoint: $('.editPoint'),
      addLine: $('.addLine'),
    };

    this.$controls = {
        appMode: $('.appMode'),
        toolbarControl: $('.toolbar-control'),
        addPlot: $('#addPlot'),
        deletePlot: $('#deletePlot'),
        addPoint: $('#addPoint'),
        editPoint: $('#editPoint'),
        deletePoint: $('#deletePoint'),
        deleteLine: $('#deleteLine'),
        selectPlot: $('#selectPlot'),
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

        plotName: $('#nameP'),
        newPlotName: $('#newPlotName'),

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

    this.$controls.selectPlot.selectBoxIt();
    this.selectBoxPlot =  this.$controls.selectPlot.data('selectBox-selectBoxIt');

    this.delegateEvents();
  };

  changeAppMode( mode ) {
    this.app.mode = mode;
    if ( this.app.mode === 'plot') {
      if ( this.app.plots[ this.app.currentPlot ].location )
        this.app.viewer.scrollTo( this.app.plots[ this.app.currentPlot ].location );
      this.app.plots[ this.app.currentPlot ].axes.correctSizes();
    }

    this.app.render();
  };

  setOrigin( event ) {
    let origins = [ parseFloat( this.$inputs.originX.val() ),
      parseFloat( this.$inputs.originY.val() ) ];

    if( origins[0] && origins[1] )
      this.app.setOrigins( origins );
    else {
      this.$inputs.originX.val( this.app.plots[ this.app.currentPlot ].axes.origin.x );
      this.$inputs.originY.val( this.app.plots[ this.app.currentPlot ].axes.origin.y );
    }
  };

  setLabel( event ) {
    let val = $( event.target ).val();
    let axis = $( event.target ).attr('id').slice( 5 ).toLowerCase();

    this.app.plots[ this.app.currentPlot ].axes.label[ axis ] = val;
    this.app.plots[ this.app.currentPlot ].axes.render();
  };

  setUnit( event ) {
    let val = $( event.target ).val();
    let axis = $( event.target ).attr('id').slice( 4 ).toLowerCase();

    this.app.plots[ this.app.currentPlot ].axes.unit[ axis ] = val;
    this.app.plots[ this.app.currentPlot ].axes.render();
  };

  setPointsVal( event ) {
    let val = parseFloat( $( event.target ).val() );
    let $target = $( event.target );
    let axis = $target.attr('id').slice( 9 ).toLowerCase();

    if ( val ) {
      this.app.plots[ this.app.currentPlot ].axes.setScale( val, axis );
      this.app.plots[ this.app.currentPlot ].axes.render();
    } else
      $target.val( this.app.plots[ this.app.currentPlot ].axes.pointsVal[ axis ] );

  };

  addPlot() {
    this.app.addPlot( this.$inputs.newPlotName.val() );
    this.$inputs.newPlotName.val('');
  }

  changePlot() {
    this.app.currentPlot = this.$controls.selectPlot.val();
    this.app.selectPlot();
  }

  deletePlot() {
    this.app.deletePlot();
  }

  setName() {
    this.app.plots[ this.app.currentPlot ].lines[ this.app.currentLine ].name = this.$inputs.lineName.val();
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
    this.app.plots[ this.app.currentPlot ].lines[ this.app.currentLine ].remove();
    this.app.plots[ this.app.currentPlot ].lines.splice( this.app.currentLine, 1 );
    if( this.app.plots[ this.app.currentPlot ].lines.length === this.app.currentLine )
      this.app.currentLine--;

    this.app.plots[ this.app.currentPlot ].lines[  this.app.currentLine ].render();
    this.renderPointSection();
    this.renderLinesSection();
  };

  addPoint() {
    let x = parseFloat( this.$inputs.pointXadd.val() ),
        y = parseFloat( this.$inputs.pointYadd.val() );

    if ( x && y ) {
      this.app.addPoint([
        this.app.plots[ this.app.currentPlot ].axes.scale.x( x )
        + this.app.plots[ this.app.currentPlot ].axes.origin.x,
        this.app.plots[ this.app.currentPlot ].axes.scale.y( y )
        + this.app.plots[ this.app.currentPlot ].axes.origin.y
      ]);

      this.$inputs.pointXadd.val('');
      this.$inputs.pointYadd.val('');
    }
  };

  editPoint() {
    let x = parseFloat( this.$inputs.pointXedit.val() ),
        y = parseFloat( this.$inputs.pointYedit.val() );

    if ( x && y ) {
      this.app.plots[ this.app.currentPlot ].lines[ this.app.currentLine ].points[ this.app.currentPoint ] =
        [ this.app.plots[ this.app.currentPlot ].axes.scale.x( x )
        + this.app.plots[ this.app.currentPlot ].axes.origin.x,
          this.app.plots[ this.app.currentPlot ].axes.scale.y( y )
          + this.app.plots[ this.app.currentPlot ].axes.origin.y ];

      this.app.plots[ this.app.currentPlot ].lines[ this.app.currentLine ].render();
      this.renderPointSection();
    }
  };

  deletePoint() {
    this.app.plots[ this.app.currentPlot ].lines[ this.app.currentLine ].deletePoint( this.app.currentPoint );
    this.app.currentPoint = false;

    this.app.plots[ this.app.currentPlot ].lines[  currentLine ].render();
    this.renderPointSection();
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

    ['Line', 'Plot'].forEach( name => {
      this.$controls[`select${ name }`].on('change',
        () => this[`change${ name }`]() );
    });



    this.$inputs.toolbarInput.on('change', event => {
      let prop = event.target.id;
      let action = 'set' + prop.slice( 0, 1 ).toUpperCase()
        + prop.slice( 1, -1 );

      this[ action ]( event );
    });

  };


  renderPlotSection() {

    this.$inputs.plotName.val(
      this.app.plots[ this.app.currentPlot ].name );
    this.$controls.deletePlot.attr('disabled',
      this.app.plots.length < 2 );

    this.$controls.selectPlot.empty();

    this.app.plots.forEach( (plot, index) => {

      let option = `
          <option value="${index}" data-text='
            <span>
              ${plot.name}
            </span>'>                   
          </option>`;

      this.$controls.selectPlot.append( option );
    });

    this.$controls.selectPlot.val( this.app.currentPlot );
    this.selectBoxPlot.refresh();
  }

  renderPointSection() {

    if( this.app.currentPoint !== false ) {
      this.$els.editPoint.show();
      this.$els.addPoint.hide();

      ['x', 'y'].forEach( axis =>
        this.$inputs[ `point${axis.toUpperCase()}edit` ].val(
          this.app.plots[ this.app.currentPlot ].axes.scale[ axis ].invert(
            this.app.plots[ this.app.currentPlot ].lines[ this.app.currentLine ].points[ this.app.currentPoint ][0]
            - this.app.plots[ this.app.currentPlot ].axes.origin[ axis ] )) );

    } else {
      this.$els.addPoint.show();
      this.$els.editPoint.hide();
    }
  };

  renderLinesSection() {

    this.$inputs.lineName.val(
      this.app.plots[ this.app.currentPlot ].lines[this.app.currentLine].name );
    this.$controls.deleteLine.attr('disabled',
      this.app.plots[ this.app.currentPlot ].lines.length < 2 );

    this.$controls.selectLine.empty();

    this.app.plots[ this.app.currentPlot ].lines.forEach( (line, index) => {

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
        this.$inputs[ `${param}${axis.toUpperCase()}` ].val(
          this.app.plots[ this.app.currentPlot ].axes[ param ][ axis ] ));
    });
    this.$inputs.originY.val(
      this.app.sizes.height - this.app.plots[ this.app.currentPlot ].axes.origin.y );

  };

  render() {

    this.$controls.appMode.each( c => {
      let $control = $( this.$controls.appMode[ c ] );
      let idMode = $control.attr('id').slice( 0, 4 );

      idMode === this.app.mode
        ? $control.removeClass('btn-outline-primary')
        : $control.addClass('btn-outline-primary');
    });

    this.renderPlotSection();
    this.renderPointSection();
    this.renderAxesSection();
    this.renderLinesSection();
  }
}