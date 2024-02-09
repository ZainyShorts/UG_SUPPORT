const data = [
    {
        _id:1,
        users:[
            {
                _id:6,
                "name":"zain",
                "online":false
            },
            {
                _id:7,
                "name":"ali",
                "online":false
            }
        ]
    },
    {
        _id:2,
        users:[
            {
                _id:8,
                "name":"zain",
                "online":false
            },
            {
                _id:9,
                "name":"ali",
                "online":false
            }
        ]
    },
    
    
]

function test(id=6)
{
    for( var arr of data )
    {
       

        if(arr.users[0]._id == id){
            arr.users[0].online = true
            console.log(arr)
            break;
        }
        else if(arr.users[1]._id == id){
            console.log(arr)
            arr.users[1].online = true
            break;
        }
    }
}
test()


