/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import { connect } from 'react-redux';

import TranslateOnCursorMove from './TranslateOnCursorMove.component';

/** @namespace Component/TranslateOnCursorMove/Container/mapStateToProps */
export const mapStateToProps = (state) => ({
    isMobile: state.ConfigReducer.device.isMobile
});

/** @namespace Component/TranslateOnCursorMove/Container/mapDispatchToProps */
// eslint-disable-next-line no-unused-vars
export const mapDispatchToProps = (dispatch) => ({});

// eslint-disable-next-line @scandipwa/scandipwa-guidelines/always-both-mappings
export default connect(mapStateToProps, mapDispatchToProps)(TranslateOnCursorMove);
