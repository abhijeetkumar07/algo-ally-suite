package com.placementgpt.repository;

import com.placementgpt.model.Profile;
import com.placementgpt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUser(User user);

    Optional<Profile> findByUserId(Long userId);
}
