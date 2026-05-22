package com.itofficerhub.dto;

import jakarta.validation.constraints.NotNull;

public record StartAttemptRequest(@NotNull Long mockTestId) {}
