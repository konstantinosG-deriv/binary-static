const japanese_client = require('../../common_functions/country_base').japanese_client;
const Client   = require('../../base/client').Client;
const Header   = require('../../base/header').Header;
const url_for  = require('../../base/url').url_for;

const Cashier = (function() {
    'use strict';

    const lock_cashier = function(withdrawal_locked, lock_type) {
        if (withdrawal_locked === 'locked') {
            $.each($('.' + lock_type), function() {
                replace_with_disabled_button($(this).parent());
            });
        }
    };

    const check_locked = function() {
        if (Client.get_boolean('is_virtual')) return;
        if (Client.status_detected('cashier_locked')) {
            lock_cashier('locked', 'deposit, .withdraw');
        } else if (Client.status_detected('withdrawal_locked')) {
            lock_cashier('locked', 'withdraw');
        } else if (Client.status_detected('unwelcome')) {
            lock_cashier('locked', 'deposit');
        } else if (sessionStorage.getItem('client_status') === null) {
            BinarySocket.send({ get_account_status: '1', passthrough: { dispatch_to: 'Cashier' } });
        }
    };

    const check_virtual_top_up = function() {
        if (Client.get_boolean('is_virtual')) {
            if ((Client.get_value('currency') !== 'JPY' && Client.get_value('balance') > 1000) ||
                (Client.get_value('currency') === 'JPY' && Client.get_value('balance') > 100000)) {
                replace_with_disabled_button('#VRT_topup_link');
            }
        }
    };

    const replace_with_disabled_button = function(elementToReplace) {
        const $a = $(elementToReplace);
        if ($a.length === 0) return;
        // use replaceWith, to disable previously caught pjax event
        $a.replaceWith($('<a/>', { class: $a.attr('class').replace('pjaxload') + ' button-disabled', html: $a.html() }));
    };

    const onLoad = function() {
        if (/\/cashier\.html/.test(window.location.pathname) && Client.get_boolean('is_logged_in')) {
            Cashier.check_locked();
            Cashier.check_virtual_top_up();
            Header.topbar_message_visibility(Client.landing_company());
        }
    };

    const onLoadPaymentMethods = function() {
        if (japanese_client()) {
            window.location.href = url_for('/');
        }
        if (Client.get_boolean('is_logged_in') && !Client.get_boolean('is_virtual')) {
            Cashier.check_locked();
        }
    };

    return {
        check_locked        : check_locked,
        check_virtual_top_up: check_virtual_top_up,
        onLoad              : onLoad,
        onLoadPaymentMethods: onLoadPaymentMethods,
    };
})();

module.exports = {
    Cashier: Cashier,
};
