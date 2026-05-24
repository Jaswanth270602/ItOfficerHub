package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;

/** Base64(JSON) wrapper so CDN/WAF does not block SQL/XSS-like text inside quiz content. */
public record ImportEncodedRequest(@NotBlank String payload) {}
