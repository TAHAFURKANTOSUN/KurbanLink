import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable icon button component with built-in accessibility
 */
const IconButton = ({
    icon: Icon,
    label,
    onClick,
    variant = 'default',
    size = 18,
    disabled = false,
    className = '',
    type = 'button',
    ...props
}) => {
    const variantClass = variant ? `icon-btn--${variant}` : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`icon-btn ${variantClass} ${className}`.trim()}
            aria-label={label}
            title={label}
            {...props}
        >
            <Icon size={size} />
        </button>
    );
};

IconButton.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['default', 'ghost', 'danger', 'primary']),
    size: PropTypes.number,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.string,
};

export default IconButton;
