import * as flatbuffers from 'flatbuffers';
import { Protocol } from '../../fbs/transport/protocol';
export declare class ListenInfo implements flatbuffers.IUnpackableObject<ListenInfoT> {
    bb: flatbuffers.ByteBuffer | null;
    bb_pos: number;
    __init(i: number, bb: flatbuffers.ByteBuffer): ListenInfo;
    static getRootAsListenInfo(bb: flatbuffers.ByteBuffer, obj?: ListenInfo): ListenInfo;
    static getSizePrefixedRootAsListenInfo(bb: flatbuffers.ByteBuffer, obj?: ListenInfo): ListenInfo;
    protocol(): Protocol;
    ip(): string | null;
    ip(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
    announcedIp(): string | null;
    announcedIp(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;
    port(): number;
    sendBufferSize(): number;
    recvBufferSize(): number;
    static startListenInfo(builder: flatbuffers.Builder): void;
    static addProtocol(builder: flatbuffers.Builder, protocol: Protocol): void;
    static addIp(builder: flatbuffers.Builder, ipOffset: flatbuffers.Offset): void;
    static addAnnouncedIp(builder: flatbuffers.Builder, announcedIpOffset: flatbuffers.Offset): void;
    static addPort(builder: flatbuffers.Builder, port: number): void;
    static addSendBufferSize(builder: flatbuffers.Builder, sendBufferSize: number): void;
    static addRecvBufferSize(builder: flatbuffers.Builder, recvBufferSize: number): void;
    static endListenInfo(builder: flatbuffers.Builder): flatbuffers.Offset;
    static createListenInfo(builder: flatbuffers.Builder, protocol: Protocol, ipOffset: flatbuffers.Offset, announcedIpOffset: flatbuffers.Offset, port: number, sendBufferSize: number, recvBufferSize: number): flatbuffers.Offset;
    unpack(): ListenInfoT;
    unpackTo(_o: ListenInfoT): void;
}
export declare class ListenInfoT implements flatbuffers.IGeneratedObject {
    protocol: Protocol;
    ip: string | Uint8Array | null;
    announcedIp: string | Uint8Array | null;
    port: number;
    sendBufferSize: number;
    recvBufferSize: number;
    constructor(protocol?: Protocol, ip?: string | Uint8Array | null, announcedIp?: string | Uint8Array | null, port?: number, sendBufferSize?: number, recvBufferSize?: number);
    pack(builder: flatbuffers.Builder): flatbuffers.Offset;
}
//# sourceMappingURL=listen-info.d.ts.map