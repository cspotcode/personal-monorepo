declare module "binary-split" {
    import { Duplex } from "stream";
    export = binarySplit;
    function binarySplit(splitOn?: Buffer): Duplex;
}
