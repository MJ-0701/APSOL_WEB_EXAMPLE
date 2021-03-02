package com.apsol.api.controller.model;

public class ErrorResource {
    private final int status;
    private final String message;

    public ErrorResource(int s, String m) {
        status = s;
        message = m;
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
