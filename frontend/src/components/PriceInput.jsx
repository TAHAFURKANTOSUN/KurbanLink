import React, { useState, useEffect } from 'react';
import './PriceInput.css';

const PriceInput = ({ value, onChange, error, placeholder = "Örn: 11500" }) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        // Format initial value
        if (value) {
            setDisplayValue(formatPrice(String(value)));
        }
    }, [value]);

    const formatPrice = (rawValue) => {
        // Remove all non-digits
        const cleaned = rawValue.replace(/\D/g, '');
        // Add thousand separators (Turkish style with dots)
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleChange = (e) => {
        const input = e.target.value;
        // Remove all non-digits
        const raw = input.replace(/\D/g, '');

        // Update display with formatting
        setDisplayValue(formatPrice(raw));

        // Pass raw numeric value to parent
        onChange({
            target: {
                name: e.target.name,
                value: raw
            }
        });
    };

    return (
        <div className="price-input-wrapper">
            <span className="price-currency">₺</span>
            <input
                type="text"
                name="price"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={`price-input ${error ? 'error' : ''}`}
            />
            <span className="price-helper">TL cinsinden</span>
        </div>
    );
};

export default PriceInput;
