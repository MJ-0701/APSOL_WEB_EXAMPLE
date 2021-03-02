package com.apsol.api.controller.model.juso;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "api.juso")
@Getter
@Setter
public class JusoApiProperties {

    private String scheme;
    private String host;
    private String type;

    private String jusoPath;
    private String jusoKey;

    private String positionPath;
    private String positionKey;

}
