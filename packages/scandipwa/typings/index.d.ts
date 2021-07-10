// Type definitions for @scandipwa/scandipwa
// Project: https://github.com/scandipwa/scandipwa, http://material-ui.com
// Definitions by: Nathan Brown <https://github.com/ngbrown>
//                 Aleksandrs Rivkinds <https://github.com/ejnshtein>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// Minimum TypeScript Version: 3.5

/// <reference types='react' />
/// <reference types='prop-types' />


// declare module '@scandipwa/scandipwa' {}

declare namespace Scandipwa {
    export interface DeviceType {
        isMobile: boolean
    }
    export interface DemoNoticeProps {
        isDemoNoticeEnabled: boolean
        device: DeviceType
    }
    /**
     * DemoNotice component
     */
    export class DemoNotice extends React.PureComponent<DemoNoticeProps> {
        /**
         * Render text for DemoNotice
         */
        renderText():JSX.Element
    }
}

declare module '@scandipwa/scandipwa/src/component/DemoNotice/DemoNotice.component' {
    export import DemoNotice = Scandipwa.DemoNotice
    export default DemoNotice
}

declare module 'SourceComponent/DemoNotice/DemoNotice.component' {
    export import DemoNotice = Scandipwa.DemoNotice
    export default DemoNotice
}

declare module 'Component/DemoNotice' {
    export import DemoNotice = Scandipwa.DemoNotice
    export default DemoNotice
}

declare module '@scandipwa/scandipwa/src/type/Device' {
    export import DeviceType = Scandipwa.DeviceType
}