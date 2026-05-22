package com.itofficerhub.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record AddGroupMembersRequest(
		@NotEmpty List<Long> userIds
) {}
