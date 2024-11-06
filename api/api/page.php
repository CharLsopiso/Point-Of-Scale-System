<?php
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class User {
        function login($json){
            include 'connection-pdo.php';
            $json = json_decode($json, true);
            $sql = "SELECT * FROM tblusers
                    WHERE usr_username = :username AND usr_password = :password";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':username', $json['username']);
            $stmt->bindParam(':password', $json['password']);
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            unset($conn); unset($stmt);
            return json_encode($returnValue);
        }
    }

    if ($_SERVER['REQUEST_METHOD'] == 'GET'){
        $operation = $_GET['operation'];
        $json = $_GET['json'];
    }else if($_SERVER['REQUEST_METHOD'] == 'POST'){
        $operation = $_POST['operation'];
        $json = $_POST['json'];
    }

    $user = new User();
    switch($operation){
        case "login":
            echo $user->login($json);
            break;
    }

    ?>