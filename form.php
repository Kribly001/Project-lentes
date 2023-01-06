Formulario de contacto
<?php
    $destino =  "maxifacha13@gmail.com"
    $nombre = $_POST["nombre"];
    $mail = $_POST["email"];
    $telefono = $_POST["tel"];
    $asunto = $_POST["mensaje"];
    $contenido = "Nombre: " . $nombre . "\nMail:  " . $mail . "\nTelefono: " . $telefono . "\nMensaje: " . $asunto;
    mail($destino,"Contacto", $contenido);
    header("Location:paginas/gracias.html");
?>