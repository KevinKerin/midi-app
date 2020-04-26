function logout(){
    $.ajax({
        method: 'GET',
        url: '/user/logout',
        headers: {
            'X-Token' : localStorage.getItem("token")
        },
        // dataType: 'JSON',
        success: function(data){
            console.log("Data:");
            console.log(data);
            window.location.replace("index.html");
        },
        error: function(data){
            console.log("Error in request");
            console.log(data);
        }
    });
}