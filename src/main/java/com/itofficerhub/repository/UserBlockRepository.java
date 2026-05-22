package com.itofficerhub.repository;

import com.itofficerhub.entity.UserBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {

	Optional<UserBlock> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

	boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

	@Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM UserBlock b WHERE (b.blocker.id = :u1 AND b.blocked.id = :u2) OR (b.blocker.id = :u2 AND b.blocked.id = :u1)")
	boolean isBlockedEitherWay(@Param("u1") Long u1, @Param("u2") Long u2);
}
