<?php
    header('Content-Type: application/json');
    header("Access-Control-Allow-Origin: *");

    class Contact {
        //login
        function getContacts($json){
            include 'connection-pdo.php';
            $json = json_decode($json, true);
            $sql = "SELECT * FROM tblcontacts
                    WHERE contact_userId = :userId
                    ORDER BY contact_name";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':userId', $json['userId']);
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
        $operation = $_POST['json'];
    }

    $contact = new Contact();
    switch($operation){
        case "login";
        echo $user->login($json);
        break;
        case "save":
        echo $user->save($json);
        break;
    }

    ?>