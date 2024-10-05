import { HttpMethod } from "./http-method";

export interface RequestMetaInfo {
    url: URL;
    method: HttpMethod;
}
