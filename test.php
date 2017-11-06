<?php

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        echo json_encode($_GET);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), $assoc = true);
        $data['id'] = rand(0, 1000000);
        echo json_encode($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), $assoc = true);
        echo json_encode($data);
        break;

    case 'DELETE':
        $id = array_pop( explode('=',$_SERVER['REQUEST_URI'] ));
        echo json_encode( $id );
        break;


}