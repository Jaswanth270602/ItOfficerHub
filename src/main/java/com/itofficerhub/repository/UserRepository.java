package com.itofficerhub.repository;

import com.itofficerhub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email);
	long countByRole(com.itofficerhub.entity.Role role);

	@Query("SELECT u FROM User u WHERE u.role = com.itofficerhub.entity.Role.USER AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.anonymousAlias) LIKE LOWER(CONCAT('%', :q, '%')))")
	List<User> searchUsers(@Param("q") String q);

	List<User> findByRoleAndShowInDirectoryTrueOrderByNameAsc(com.itofficerhub.entity.Role role);
}
