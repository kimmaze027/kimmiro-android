package com.kimmiro.app;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String HIDE_NAV_JS =
        "(function(){" +
        "  var inject=function(){" +
        "    if(document.head&&!document.getElementById('hnc')){" +
        "      var s=document.createElement('style');" +
        "      s.id='hnc';" +
        "      s.textContent='a[href=\\\"/\\\"],a[href=\\\"/about\\\"],a[href=\\\"/projects\\\"]{display:none!important}';" +
        "      document.head.appendChild(s);" +
        "    }" +
        "  };" +
        "  inject();" +
        "  setInterval(inject,2000);" +
        "})();";

    @Override
    public void onResume() {
        super.onResume();
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().evaluateJavascript(HIDE_NAV_JS, null);
        }
    }
}
