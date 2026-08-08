package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "app_download_counters")
public class AppDownloadCounter {

	@Id
	@Column(name = "app_key", length = 64)
	private String appKey;

	@Column(name = "download_count", nullable = false)
	private long downloadCount;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt = Instant.now();

	public String getAppKey() { return appKey; }
	public void setAppKey(String appKey) { this.appKey = appKey; }

	public long getDownloadCount() { return downloadCount; }
	public void setDownloadCount(long downloadCount) { this.downloadCount = downloadCount; }

	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
