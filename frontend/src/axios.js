import axios from 'axios'

const ax = axios.create({
    baseURL: SERVER,
    timeout: 30000,
})

export default ax