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
import PropTypes from 'prop-types';

import CmsBlockQuery from 'Query/CmsBlock.query';
import DataContainer from 'Util/Request/DataContainer';

import CmsBlock from './CmsBlock.component';

/** @namespace Component/CmsBlock/Container */
export class CmsBlockContainer extends DataContainer {
    static propTypes = {
        identifier: PropTypes.string.isRequired
    };

    state = {
        cmsBlock: {}
    };

    containerProps = () => {
        const { blockType } = this.props;
        const { cmsBlock } = this.state;

        return { cmsBlock, blockType };
    };

    componentDidMount() {
        this._getCmsBlock();
    }

    _getCmsBlock() {
        const { identifier } = this.props;

        this.fetchData(
            [CmsBlockQuery.getQuery({ identifiers: [identifier] })],
            ({ cmsBlocks: { items } }) => {
                if (!items.length) {
                    return;
                }

                this.setState({ cmsBlock: items[0] });
            }
        );
    }

    render() {
        return (
            <CmsBlock
              { ...this.containerProps() }
            />
        );
    }
}

export default CmsBlockContainer;
