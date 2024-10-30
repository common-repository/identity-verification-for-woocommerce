<?php

namespace RealID\Models;

/**
 * ID check related data mappings constants & helpers
 * 
 * Not responsible for retrieving ID check data, but is the source of truth for possible check states & statuses
 */
class IDCheck {
  const CANONICAL_STATUS_MAPPING = [
    'delivered' => 'Delivered',
    'opened' => 'Opened',
    'id' => 'Submitted ID photo',
    'face_match' => 'Submitted headshot photo',
    'in_review' => 'In review',
    'completed' => 'Completed',
    'failed' => "Failed",
    'manually_approved' => "Manually approved",
    'manually_rejected' => 'Manually rejected'
  ];

  const IN_PROGRESS_STATUSES = [
    'delivered',
    'opened',
    'id',
    'face_match',
  ];

  const IN_REVIEW_STATUSES = [
    'in_review',
  ];

  const COMPLETED_STATUSES = [
    'completed',
    'manually_approved',
  ];

  const FAILED_STATUSES = [
    'failed',
    'manually_rejected',
  ];

  public static function translate_canonical_status($status) {
    return self::CANONICAL_STATUS_MAPPING[$status];
  }

  public static function all_check_statuses() {
    return array_merge(self::IN_PROGRESS_STATUSES, self::IN_REVIEW_STATUSES, self::COMPLETED_STATUSES, self::FAILED_STATUSES);
  }
}
