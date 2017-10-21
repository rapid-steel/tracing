<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
	<META HTTP-EQUIV="Access-Control-Allow-Origin" CONTENT="http://localhost/">
    <title>Plot Inking</title>
    <link rel="stylesheet" href="css/font-awesome.css">

    <link type="text/css" rel="stylesheet" href="http://gregfranko.com/jquery.selectBoxIt.js/css/jquery.selectBoxIt.css" />
    <link rel="stylesheet" href="css/bootstrap.css">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

<div id="view-toolbar">
    <div id="zoom-plus" class="view-control zoom font-weight-bold">
        <i class="fa fa-search-plus" aria-hidden="true"></i>
    </div>
    <div id="zoom-minus" class="view-control zoom font-weight-bold">
        <i class="fa fa-search-minus" aria-hidden="true"></i>
    </div>
    <input id="zoom-value" type="number" step="1" class="form-control view-control-input"> %


    <div id="pages" class="view-control-mode view-control-pdf">
        <div id="prev-page" class="view-control page-control font-weight-bold">
            <i class="fa fa-arrow-circle-o-up" aria-hidden="true"></i>
        </div>
        <div id="next-page" class="view-control page-control font-weight-bold">
            <i class="fa fa-arrow-circle-o-down" aria-hidden="true"></i>
        </div>

        <input id="page-number" class="form-control view-control-input"> / <span id="page-count"></span>

    </div>

	<div class="view-control ml-2 font-weight-bold" id="location">
		<i class="fa fa-lock" aria-hidden="true"></i>
	</div>

</div>


<div id="app-container" class="container-fluid">
    <div class="row">
        <div class="col-9" id="document-container">
					<div id="document" style="overflow: scroll">
					</div>
        </div>

        <div class="col-3" id="toolbar">

					<hr>

					<div class="col text-center">
						Add plot
					</div>

					<div class="row">
						<div class="col-8 offset-1">
							<input class="addPlot form-control" id="newPlotName">
						</div>
						<button class="btn btn-primary col-2 toolbar-control" id="addPlot" title="Add plot">
							<i class="fa fa-plus" aria-hidden="true"></i>
						</button>
					</div>

					<div class="col text-center">
						Current plot
					</div>

					<div class="row">

						<div class="col-6 offset-1">
							<input class="form-control toolbar-input" type="text" id="plotNameP">
						</div>

						<button class="col-2 btn btn-primary ml-2 toolbar-control plot-control" id="jumpToPlot" title="Delete plot">
							<i class="fa fa-crosshairs" aria-hidden="true"></i>
						</button>

							<button class="col-2 btn btn-primary ml-2 toolbar-control plot-control" id="deletePlot" title="Delete plot">
								<i class="fa fa-trash" aria-hidden="true"></i>
							</button>

					</div>

					<div class="row">
						<div class="col-8 offset-1">
							<select class="form-control" id="selectPlot"></select>
						</div>
					</div>

					<hr>

					<div class="row">

						<button class="btn btn-primary col-4 offset-2 text-center appMode font-weight-bold" id="plotMode">
							<i class="fa fa-line-chart" aria-hidden="true"></i> Graph
						</button>
						<button class=" btn btn-primary col-4 text-center appMode font-weight-bold" id="readMode">
							<i class="fa fa-file-text-o" aria-hidden="true"></i> Read
						</button>

					</div>

					<hr>

            <div class="col addPoint text-center">
                Add point
            </div>
            <div class="col editPoint text-center">
                Edit point
            </div>

            <div class="row">
                <input class="col-3 offset-2 addPoint form-control" id="pointXadd" type="number" step="0.001">
                <input class="col-3 addPoint form-control" id="pointYadd" type="number" step="0.001">

                    <button class="col-2 offset-1 addPoint btn btn-primary toolbar-control" id="addPoint" title="Add point">
                        <i class="fa fa-plus" aria-hidden="true"></i>
                    </button>

                <input class="col-3 editPoint offset-1 form-control" id="pointXedit" type="number" step="0.001">
                <input class="col-3 editPoint form-control" id="pointYedit" type="number" step="0.001">

                <div class="col-2 editPoint">
                    <button class="btn btn-primary toolbar-control" id="editPoint" title="Save point">
                        <i class="fa fa-floppy-o" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="col-2 editPoint">
                    <button class="btn btn-primary toolbar-control" id="deletePoint" title="Delete point">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <hr>

            <div class="col text-center">
                Add line
            </div>

            <div class="row">
                <div class="col-8 offset-1">
                    <input class="addLine form-control" id="newLineName">
                </div>
                <button class="btn btn-primary col-2 toolbar-control" id="addLine">
                    <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
            </div>

            <hr>

            <div class="col text-center">
                Current line
            </div>

            <div class="row">
                <div class="col-8 offset-1">
                    <input class="form-control toolbar-input" type="text" id="nameL">
                </div>
                <button class="btn btn-primary col-2 toolbar-control" id="deleteLine" title="Delete line">
                    <i class="fa fa-trash" aria-hidden="true"></i>
                </button>

            </div>

            <div class="row">
                <div class="col-8 offset-1">
                    <select class="form-control" id="selectLine"></select>
                </div>
            </div>

            <hr>

            <div class="col text-center">
                Edit axes
            </div>

            <div class="row">
                <div class="col-4 offset-3 text-center">X</div>
                <div class="col-4 text-center">Y</div>
            </div>

            <div class="row">
                <div class="col-3 text-right">
                    Origin
                </div>
                <input class=" col-4 form-control origin toolbar-input" type="number" id="originX" step="0.1">
                <input class=" col-4 form-control origin toolbar-input" type="number" id="originY" step="0.1">
            </div>

            <div class="row">
                <div class="col-3 text-right">
                    Label
                </div>
                <input class="col-4 form-control labelAxis toolbar-input" type="text" id="labelX">
                <input class="col-4 form-control labelAxis toolbar-input" type="text" id="labelY">
            </div>

            <div class="row">
                <div class="col-3 text-right">
                    Unit
                </div>
                    <input class="col-4 form-control unit toolbar-input" type="text" id="unitX">
                    <input class="col-4 form-control unit toolbar-input" type="text" id="unitY">
            </div>

            <div class="row">
                <div class="col-3 text-right">
                    Known point
                </div>
                <input class="col-4 form-control pointsVal toolbar-input" type="number" id="pointsValX" step="0.001">
                <input class="col-4 form-control pointsVal toolbar-input" type="number" id="pointsValY" step="0.001">
            </div>

            <hr>

            <div class="row">
                <button class=" col-4 offset-2 btn btn-primary toolbar-control font-weight-bold" id="send">Save</button>
								<a href="documents.html" class=" col-4 ml-2 btn btn-primary font-weight-bold">Back</a>
            </div>
        </div>
    </div>

</div>



<script src="js/lib/jquery-3.1.1.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
<script src="http://gregfranko.com/jquery.selectBoxIt.js/js/jquery.selectBoxIt.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/1.9.640/pdf.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/1.9.640/pdf.worker.js"></script>

<script src="js/lib/bootstrap.js"></script>
<script src="js/lib/d3.v4.js"></script>

<script>

	<?php
		echo "let id = '$_GET[doc_id]';"
	?>

</script>

<script src="js/app/axes.js"></script>
<script src="js/app/line.js"></script>
<script src="js/app/plot.js"></script>
<script src="js/app/toolbar.js"></script>
<script src="js/app/viewer.js"></script>
<script src="js/app/main.js"></script>

</body>
</html>