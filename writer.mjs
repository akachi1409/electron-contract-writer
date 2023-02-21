import Hyperswarm from 'hyperswarm'
import Hyperbee from "hyperbee";
import Corestore from 'corestore';
import b4a from 'b4a'
import goodbye from 'graceful-goodbye'
import {v4 as uuidv4} from "uuid";

const store = new Corestore("./storage")
// await store.ready();


const swarm = new Hyperswarm();
goodbye(() => swarm.destroy());

const core = store.get({ name: 'my-bee-core' })
await core.ready()
const bee = new Hyperbee(core, {
    keyEncoding: 'utf-8',
    valueEncoding: 'utf-8'
})

swarm.on('connection', conn => {
    store.replicate(conn);
    conn.on('data', async function (data){
        var message = data.toString();
        // console.log("message", message)
        if (message.substring(0,11) === "contractAdd"){
            const uid = uuidv4();
            const content = message.substring(11, message.length -1) + ', "id":"' + uid + '"}'; 
            console.log("content", content);
            await bee.put(uid,content);
        }
        if (message.substring(0,11) === "contractDel"){
            const id = message.substring(12);
            console.log('id', id)
            await bee.del(id);
        }
    })
})
const discovery = swarm.join(core.discoveryKey)
discovery.flushed().then(() => {
    console.log('bee key:', b4a.toString(core.key, 'hex'))
})