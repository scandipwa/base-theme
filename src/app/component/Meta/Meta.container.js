import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Meta from './Meta.component';

export const mapStateToProps = state => ({
    default_description: state.MetaReducer.default_description,
    default_keywords: state.MetaReducer.default_keywords,
    default_title: state.MetaReducer.default_title,
    canonical_url: state.MetaReducer.canonical_url,
    title_prefix: state.MetaReducer.title_prefix,
    title_suffix: state.MetaReducer.title_suffix,
    description: state.MetaReducer.description,
    keywords: state.MetaReducer.keywords,
    title: state.MetaReducer.title
});

export class MetaContainer extends PureComponent {
    static propTypes = {
        default_description: PropTypes.string,
        default_keywords: PropTypes.string,
        default_title: PropTypes.string,
        canonical_url: PropTypes.string,
        title_prefix: PropTypes.string,
        title_suffix: PropTypes.string,
        description: PropTypes.string,
        keywords: PropTypes.string,
        title: PropTypes.string
    };

    static defaultProps = {
        default_description: '',
        default_keywords: '',
        default_title: '',
        canonical_url: '',
        title_prefix: '',
        title_suffix: '',
        description: '',
        keywords: '',
        title: ''
    };

    containerProps = () => ({
        metadata: this._getMetadata()
    });

    _generateMetaFromMetadata(metadata, param = 'name') {
        return Object.entries(metadata).reduce((acc, [key, value]) => (
            value
                ? [...acc, { [param]: key, content: `${value}` }]
                : acc
        ), []);
    }

    _getTitle() {
        const { title, default_title } = this.props;

        return title || default_title;
    }

    _getDescription() {
        const { description, default_description } = this.props;

        return description || default_description;
    }

    _getKeywords() {
        const { keywords, default_keywords } = this.props;

        return keywords || default_keywords;
    }

    _getMetadata() {
        const meta = {
            title: this._getTitle(),
            description: this._getDescription(),
            keywords: this._getKeywords()
        };

        return this._generateMetaFromMetadata(meta);
    }

    render() {
        return (
            <Meta
              { ...this.props }
              { ...this.containerProps() }
            />
        );
    }
}

export default connect(mapStateToProps)(MetaContainer);
