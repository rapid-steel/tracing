let ToolbarController = (function() {

  return function( $scope, appService ) {

    $scope.models = {
      newPoint: { x: 0, y: 0 },
      newPlot: '',
      newLine: ''
    };

    $scope.$on('docLoaded', () => init() );

    let init = function() {

      $scope.$container = $('#document');
      $scope.sizes = {
        width: $scope.$container.prop('scrollWidth'),
        height: $scope.$container.height()
      };

      $scope.svg = d3.select('#document-container')
        .append('svg')
        .attr('id', 'plot')
        .attr('width', $scope.sizes.width)
        .attr('height', $scope.sizes.height);

      $scope.overlay = $scope.svg.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', $scope.sizes.width)
        .attr('height', $scope.sizes.height)
        .style('fill', 'white')
        .style('opacity', .5);

      $scope.plotGr = $scope.svg.append('g');
      $scope.pointsGr = $scope.svg.append('g');

      $scope.currentPlot = 0;
      $scope.currentLine = 0;
      $scope.currentPoint = false;

      $scope.plots = [];
      if( $scope.selectedDoc.plots.length )
        $scope.selectedDoc.plots.forEach( plot => $scope.plots.push(new Plot($scope, plot )) );
      else
        $scope.plots.push(new Plot( $scope ));

      $scope.plots[ 0 ].init();


      $('#selectLine').selectBoxIt();
      $scope.selectBox =  $('#selectLine').data('selectBox-selectBoxIt');
      $scope.updateSelectLine();

      $('#selectPlot').selectBoxIt();
      $scope.selectBoxPlot =  $('#selectPlot').data('selectBox-selectBoxIt');
      $scope.updateSelectPlot();

      $('#selectLine').on('change', (event ) => $scope.selectLine( event.currentTarget.value ) );
      $('#selectPlot').on('change', (event ) => $scope.selectPlot( event.currentTarget.value ) );

      $scope.setMode('read');


      $scope.svg.on('click', () => {

        if( $(d3.event.target).hasClass('point') ) {
          let ids = $(d3.event.target).attr('id').split('_');
          $scope.selectPoint( +ids[0].slice(2), +ids[1].slice(1) );

        } else {
          let coord = d3.mouse($('#plot')[0]);
          $scope.addPoint( coord );
        }
      });

      $scope.svg.on('contextmenu', () => {
        let $target = $(d3.event.target);

        if( $target.hasClass('point') ) {
          let ids = $target.attr('id').split('_');
          d3.event.preventDefault();
          $scope.deletePoint( ids[0].slice(2), ids[1].slice(1) );
        }
      });

      $(window).on('resize', () => {
        $scope.plots.forEach( plot => {
          let oldSizes = plot.axes.correctSizes();
          $scope.sizes = oldSizes;
        });
        $scope.sizes = {
          width: $scope.$container.width(),
          height: $('#document-container').height()
        };

        $scope.$emit('toolbarLoaded');
      });
    };


    $scope.update = function( fromForm ) {

      $scope.models.newPoint = $scope.currentPoint
        ? $scope.plots[ $scope.currentPlot ].axes.invertPoint( $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].points[ $scope.currentPoint ] )
        : {x: 0, y: 0};

      if( !fromForm )
        $scope.$apply();
    };

    $scope.updateAxes = function() {
      $scope.plots[ $scope.currentPlot ].axes.render();
      $scope.update( true );
    };

    $scope.setOrigins = function() {
      $scope.plots[ $scope.currentPlot ].axes.setOrigins();
      $scope.updateAxes();
    };


    $scope.updateSelectLine = function() {
      let select = $('#selectLine');
      select.empty();
      $scope.plots[ $scope.currentPlot ].lines.forEach( (line, index) => {
        let option = `
          <option value="${index}" data-text='
            <span>
              <b style="color: ${ line.color }!important">&#9679;</b>  
              ${line.name}
            </span>'>                   
          </option>`;

        select.append( option );
      });
      select.val( $scope.currentLine );
      $scope.selectBox.refresh();
    };

    $scope.updateSelectPlot = function() {
      let select = $('#selectPlot');
      select.empty();
      $scope.plots.forEach( (plot, index) => {
        let option = `
          <option value="${index}" data-text='
            <span>
              ${plot.name}
            </span>'>                   
          </option>`;
        select.append( option );
      });
      select.val( $scope.currentPlot );
      $scope.selectBoxPlot.refresh();
    };


    $scope.selectPlot = function( plot ) {

      $scope.removePlot();
      $scope.currentPlot = plot;

      $scope.jumpToPlot();

      $scope.plots[ $scope.currentPlot ].init();
      $scope.plots[ $scope.currentPlot ].axes.correctSizes();
      $scope.plots[ $scope.currentPlot ].lines.forEach( line => line.render() );

      $scope.updateSelectLine();
      $scope.update();
    };

    $scope.addPlot = function( name ) {

      $scope.plots.push(new Plot( $scope ));
      $scope.currentPlot = $scope.plots.length - 1;
      $scope.plots[ $scope.currentPlot ].name = $scope.models.newPlot || 'Plot' + $scope.plots.length;
      $scope.models.newPlot = '';

      $scope.removePlot();
      $scope.plots[ $scope.currentPlot ].init();
      $scope.plots[ $scope.currentPlot ].axes.correctSizes();
      $scope.updateSelectPlot();
      $scope.updateSelectLine();
      $scope.update( true );
    };

    $scope.removePlot = function() {
      $scope.plotGr.remove();
      $scope.pointsGr.remove();
      $scope.svg.select('.originPoint').remove();

      $scope.plotGr = $scope.svg.append('g');
      $scope.pointsGr = $scope.svg.append('g');

      $scope.currentLine = 0;
      $scope.currentPoint = false;

      $scope.updateSelectLine();
    };

    $scope.deletePlot = function() {
      $scope.removePlot();
      $scope.plots.splice( $scope.currentPlot, 1 );
      if( $scope.plots.length === +$scope.currentPlot )
        $scope.currentPlot--;

      $scope.jumpToPlot();

      $scope.plots[ $scope.currentPlot ].axes.correctSizes();
      $scope.plots[ $scope.currentPlot ].initDraw();
      $scope.plots[ $scope.currentPlot ].lines.forEach( line => line.render() );

      $scope.updateSelectLine();
      $scope.updateSelectPlot();
      $scope.update( true );
    };

    $scope.jumpToPlot = function() {

      if ( $scope.plots[ $scope.currentPlot ].location ) {
        $scope.setLocation( $scope.plots[ $scope.currentPlot ].location );
      }

    };

    $scope.$on('changeLocation', function() {
      $scope.plots[ $scope.currentPlot ].location = $scope.location;
    });




    $scope.selectPoint = function( line, point ) {

      $scope.currentLine = line;
      $scope.currentPoint = point;
      $scope.update();
      $scope.updateSelectLine();
    };

    $scope.addPoint = function( coord, fromForm ) {
      if ( fromForm )
        coord = $scope.plots[ $scope.currentPlot ].axes.scalePoint( $scope.models.newPoint );

      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].addPoint( coord );
      $scope.currentPoint = $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].points.indexOf( coord );

      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].render();
      $scope.update( fromForm );
    };

    $scope.editPoint = function( coords ) {
      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].points[ $scope.currentPoint ] =
        $scope.plots[ $scope.currentPlot ].axes.scalePoint( $scope.models.newPoint );
      $scope.update( fromForm );
    };

    $scope.deletePoint = function( line, point, fromForm ) {
      $scope.currentLine = line;
      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].deletePoint( point );
      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].render();

      if( +point === $scope.currentPoint )
        $scope.currentPoint = false;

      $scope.update( fromForm );
    };



    $scope.selectLine = function( line ) {
      $scope.currentLine =  line;
      $scope.currentPoint = false;
      $scope.update();
    };


    $scope.addLine = function() {

      let name = $scope.models.newLine !== ''
        ? $scope.models.newLine
        : 'line' + ( $scope.plots[ $scope.currentPlot ].lines.length + 1 );

      $scope.plots[ $scope.currentPlot ].lines.push( new Line( name, $scope ) );
      $scope.currentLine = $scope.plots[ $scope.currentPlot ].lines.length - 1;

      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].init();

      $scope.currentPoint = false;

      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].render();
      $scope.models.newLine = '';
      $scope.updateSelectLine();
      $scope.update( true );

    };

    $scope.deleteLine = function() {
      $scope.plots[ $scope.currentPlot ].lines[ $scope.currentLine ].remove();
      $scope.plots[ $scope.currentPlot ].lines.splice( $scope.currentLine, 1 );
      if( $scope.plots[ $scope.currentPlot ].lines.length === $scope.currentLine )
        $scope.currentLine--;

      $scope.currentPoint = false;

      $scope.plots[ $scope.currentPlot ].lines[  $scope.currentLine ].render();
      $scope.updateSelectLine();
      $scope.update( true );
    };


    $scope.setPoint = function( axis ) {
      $scope.plots[ $scope.currentPlot ].axes.setScale( $scope.plots[ $scope.currentPlot ].axes.pointsVal[ axis], axis );
      $scope.updateAxes();
    };

    $scope.setMode = function( mode ) {
      $scope.mode = mode;
      $scope.svg
        .style('display', mode === 'plot' ? 'block' : 'none');

      $('#selectLine').attr('disabled', mode === 'read' );
      $scope.updateSelectLine();

      if ( mode === 'plot' ) $scope.jumpToPlot();
    };


    $scope.save = function() {
      let plots = [];

      $scope.plots.forEach( plot => {
        if (!plot.location)
          plot.location = $scope.getLocation();

        let data = {
          name: plot.name,
          location: plot.location,
          origin: [
            plot.axes.origin.x, $scope.sizes.height - plot.axes.origin.y ],
          points: plot.axes.points,
          pointsVal: plot.axes.pointsVal,
          label: plot.axes.label,
          unit: plot.axes.unit,
          lines: []
        };

        plot.lines.forEach(line =>
          data.lines.push({
            color: line.color,
            name: line.name,
            points: line.points
          }));

        plots.push(data);
      });

      $scope.selectedDoc.plots = plots;
      appService.saveDocument( $scope.selectedDoc ).then( resp => {
        console.log( resp );
      });
    };


  }

})();