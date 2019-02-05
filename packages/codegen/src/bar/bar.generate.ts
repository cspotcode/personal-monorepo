import { CodeGenApi } from "../main";

export default (api: CodeGenApi) => {
    api.emit('another', 'this is another');
    return '// bar hello';
}
