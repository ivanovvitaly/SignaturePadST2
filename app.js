Ext.application({
    name: 'ST2',

    requires: [
        'Ext.MessageBox',
        'ST2.plugin.SignaturePad'
    ],
    
    controllers: ["CompanyAgreement"],
    views: ['Main'],

    launch: function() {
        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();

        // Initialize the main view
        Ext.Viewport.add(Ext.create('ST2.view.Main'));
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
