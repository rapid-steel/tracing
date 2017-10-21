<?php

$url = $_GET['url'];



header("Content-type:application/pdf");
header("Content-Disposition:inline;filename='$url");

echo readfile($url);
